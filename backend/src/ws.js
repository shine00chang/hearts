import { Server } from 'socket.io';
import { wsauth } from './auth.js';

const rooms = new Map();
// Testing room:
rooms.set("TEST", {
    id: "TEST",
    users: [
        { id: 'alice', username: 'Alice' },
        { id: 'bessie', username: 'Bessie' },
        { id: 'cow', username: 'Cow' }
    ],
    readyState: {
        alice: true,
        bessie: true,
        cow: true,
    }
});

const socketIdMap = new Map();

export default function setWS (server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
    }
  });

  io.on('connection', socket => setSocket(socket, io));
}

function setSocket (socket, io) 
{
  const { session } = socket.handshake.auth;
  let { roomId } = socket.handshake.query;

  const user = wsauth(session);

  if (typeof roomId == 'string' && roomId.length == 4) {
    console.log(`user connected requesting roomId: ${roomId}, with session token: ${session}`);
  } else {
    const genId = _ => {
      const v = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let out = "";
      do {
        for (let i=0; i<4; i++) out += v.charAt(Math.floor(Math.random()*v.length));
      } while (rooms.has(out));
      return out;
    }
    roomId = genId();
    console.log(`user connected with undefined roomId, creating room ${roomId}, with session token: ${session}`);
  }

  // 4 player limit check
  if (rooms.has(roomId) && rooms.get(roomId).users.length >= 4) {
    console.log('room full, rejecting user');
    socket.emit('nojoin', { message: 'Room is full' });
    socket.disconnect();
    return;
  }

  socket.join(roomId);

  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      users: [],
      readyState: {}
    });
  }

  const room = rooms.get(roomId);
  
  // Add user
  room.users.push(user);
  room.readyState[user.id] = false; // All players start as 'not ready' after joining room
  socketIdMap.set[user.id] = socket.id; // Map a new user to their socket id

  // Broadcast state whenever a new player joins
  emitRoomState(io, roomId);

  // ready, unready, leave, and disconnect event handling 
  socket.on('ready', () => handleReady(io, roomId, user.id));
  socket.on('unready', () => handleUnready(io, roomId, user.id));
  socket.on('leave', () => handleLeave(io, roomId, user.id));
  socket.on('disconnect', () => {
    console.log('user disconnected');
    handleLeave(io, roomId, user.id);
  });

  // game event handling
  socket.on('pass', (cards) => handlePass(io, roomId, user.id, cards));
  socket.on('play', (card) => handleSelectPass(io, roomId, user.id, card));
}

// EVENT HANDLERS: 
function emitRoomState (io, roomId) {
  io.to(roomId).emit('state', rooms.get(roomId));
}

function handleReady (io, roomId, userId) {
  console.log('received ready');

  const room = rooms.get(roomId);
  room.readyState[userId] = true;
  emitRoomState(io, roomId); // Frontend will display some "player_username ready" message

  // If all 4 players are ready, start the game
  if (
    room.users.length === 4 && 
    room.users
      .map(user => user.id)
      .map(id => room.readyState[id])
      .reduce((all, ready) => all && ready, true)) {

    console.log(`Start a game in room ${roomId}`);
    initGameState(io, roomId);
    emitRoomState(io, roomId);
  }
}

function handleUnready (io, roomId, userId) {
  const room = rooms.get(roomId);
  room.readyState[userId] = false;

  emitRoomState(io, roomId);
}

function handleLeave (io, roomId, userId) {
  console.log(`User ${userId} leaving room ${roomId}`);
  const room = rooms.get(roomId);

  // remove user from room
  room.users = rooms.get(roomId).users.filter(u => u.id !== userId);
  delete room.readyState[userId];

  // if room is empty, delete it
  if (room.users.length === 0) {
    console.log(`Room ${roomId} is now empty. Deleting`);
    rooms.delete(roomId);
    return;
  }

  emitRoomState(io, roomId);
}

function handlePass (io, roomId, cards) {
  // TODO:
  const room = rooms.get(roomId);
  const game = room.gameState;
  const users = room.users;
  const direction = getPassDirection(game.roundNumber);

  // Make sure that all players involved have selected their 3 cards before passing
  const passingBuffer = game.passing;

  for (let i = 0; i < 4; i++) {
    const userId = room.users[i].id;

    if (!passingBuffer.has(userId) || passingBuffer.get(userId).length < 3) {
      return;
    }
  }

  if (direction === 'hold') {
    // No passing this round
    game.phase = 'playing';
    for (let i = 0; i < 4; i++) {
      const userId = room.users[i].id;
      const socketId = socketIdMap.get(userId);
      io.to(socketId).emit('passdone', {
        hand: game.hands.get(userId),
        phase: game.phase,
      });
    }

    return;
  }


  /*
   * Each player has two card arrays: hands[userId] (stores all the cards they currently have including passing cards) and passing[userId] (stores cards to be passed)
   * 
   * 1) First remove all passing.get(userId) cards from the hands.get(userId) array
   * 2) Perform appropriate exchange operations on passing[userId] map
   * 3) Push all passing[userId] cards back onto the hands[userId] map
   */
  

  // Removing passing cards from hands
  let hands = room.gameState.hands;
  for (let i = 0; i < 4; i++) {
    const userId = room.users[i].id;
    let passing = room.gameState.passing.get(userId);
    let curHand = hands.get(userId);
    

    for (let j = 0; j < 3; j++) {
      const index = findIndex(passing[j].suite, passing[j].value, curHand);
      curHand.splice(index, 1);
    }
  }

  // Appropriate operations
  if (direction == 'left') {
    let temp = [];
    copyVals(temp, passingBuffer.get(users[3].id));
    copyVals(passingBuffer.get(users[3].id), passingBuffer.get(users[2].id));
    copyVals(passingBuffer.get(users[2].id), passingBuffer.get(users[1].id));
    copyVals(passingBuffer.get(users[1].id), passingBuffer.get(users[0].id));
    copyVals(passingBuffer.get(users[0].id), temp);
  }
  else if (direction == 'right') {
    let temp = [];
    copyVals(temp, passingBuffer.get(users[0].id));
    copyVals(passingBuffer.get(users[0].id), passingBuffer.get(users[1].id));
    copyVals(passingBuffer.get(users[1].id), passingBuffer.get(users[2].id));
    copyVals(passingBuffer.get(users[2].id), passingBuffer.get(users[3].id));
    copyVals(passingBuffer.get(users[3].id), temp);
  }
  else {
    let temp = [];
    copyVals(temp, passingBuffer.get(users[0].id));
    copyVals(passingBuffer.get(users[0].id), passingBuffer.get(users[2].id));
    copyVals(passingBuffer.get(users[2].id), temp);

    copyVals(temp, passingBuffer.get(users[1].id));
    copyVals(passingBuffer.get(users[1].id), passingBuffer.get(users[3].id));
    copyVals(passingBuffer.get(users[3].id), temp);
  }

  // Push passing[userId] cards to hands[userId] cards
  for (let i = 0; i < 4; i++) {
    const userId = room.users[i].id;
    let passing = room.gameState.passing.get(userId);
    let curHand = hands.get(userId);

    for (let j = 0; j < 3; j++) {
      curHand.push(passing[j]);
    }
  }

  game.phase = 'playing';

  // Emit new hands for each player
  for (let i = 0; i < 4; i++) {
    const userId = room.users[i].id;
    const socketId = socketIdMap.get(userId);

    io.to(socketId).emit('passdone', {
      hand: game.hands.get(userId),
      phase: game.phase, 
    });
  }

  io.to(roomId).emit('phasechange', { phase: game.phase });
}


// GAME BUILDERS: 

// Creates the game state object
function initGameState (io, roomId) {
  let deck = shuffleDeck(buildDeck());

  let room = rooms.get(roomId);
  room.gameState = {
    hands: {},        // userId -> Cards[] (13 cards for each player)

    passing: true,
    passes: {},      // userId -> Cards[] (3 cards each player wants to pass to a different player)
    passDirection: getPassDirection(1),
    trick: {},            // {userId, card} played for this trick round
    leader: undefined,        // Lead suite played for this trick round
    turn: undefined,              // userId -> Who plays next (Starting player has 2 of Clubs)
    heartsBroken: false,     
    roundScores: {},
    roundNumber: 1,
  };

  // for each user
  for (const [ i, user ] of room.users.entries()) {
  
    // create hand
    let hand = [];

    for (let j = 0; j < 13; j++) {
      hand.push(deck[(i * 13) + j]);
      if (deck[(i * 13) + j].suit === 'C' && deck[(i * 13) + j].value === '2') {
        room.gameState.turn = user.id;
      }
    }
    room.gameState.hands[user.id] = hand;
    room.gameState.roundScores[user.id] = 0;
  }
}

function buildDeck () {
  const deck = [];

  const suites = ['H', 'D', 'C', 'S'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  for (let i = 0; i < suites.length; i++) {
    for (let j = 0; j < values.length; j++) {
      deck[(i * 13) + j] = {'suit': suites[i], 'value': values[j]};
    }
  }

  return (deck);
}

function shuffleDeck (deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return (deck);
} 

function getPassDirection (roundNumber) {
  const r = (roundNumber - 1) % 4;
  if (r == 0) return 'left';
  if (r == 1) return 'right';
  if (r == 2) return 'across';
  return 'hold';
}

function findIndex (suite, value, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].suite === suite && array[i].value === value) {
      return (i);
    }
  }

  return (-1);
}

// Copy values from arrayTwo into arrayOne
function copyVals (arrayOne, arrayTwo) {
  for (let i = 0; i < arrayTwo.length; i++) {
    const suite = arrayTwo[i].suite;
    const val = arrayTwo[i].value;
    arrayOne[i] = {suite: suite, value: val};
  }
}
