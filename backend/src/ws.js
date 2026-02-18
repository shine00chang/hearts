import { Server } from 'socket.io';
import { wsauth } from './auth.js';

// Mock room storage (Change to appropriate db queries later)
const rooms = new Map();
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
      readyState: new Map()
    });
  }

  const room = rooms.get(roomId);
  
  // Add user
  room.users.push(user);
  room.readyState.set(user.id, false); // All players start as 'not ready' after joining room
  socketIdMap.set(user.id, socket.id); // Map a new user to their socket id

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

  // selectpass event handling
  socket.on('selectpass', (card) => handleSelectPass(io, roomId, user.id, card));

  // TODO: Add pass event handling (Users lock in their cards for passing)
  // TODO: Add makemove event handling (Users play a card down; Add appropriate game logic)
}

// EVENT HANDLERS: 

function emitRoomState (io, roomId) {
  io.to(roomId).emit('state', rooms.get(roomId));
}

function handleReady (io, roomId, userId) {
  const curRoom = rooms.get(roomId);
  curRoom.readyState.set(userId, true);
  emitRoomState(io, roomId); // Frontend will display some "player_username ready" message

  // If all 4 players are ready, start the game
  if (curRoom.users.length === 4) {
    let allReady = true;

    for (const isReady of curRoom.readyState.values()) {
      if (!isReady) {
        allReady = false;
        break;
      }
    }

    if (allReady) {
      io.to(roomId).emit('start');
      console.log(`Start a game in room ${roomId}`);
      initGameState(io, roomId);
    }
  }
}

function handleUnready (io, roomId, userId) {
  const curRoom = rooms.get(roomId);
  curRoom.readyState.set(userId, false);
  emitRoomState(io, roomId); // Display some "player_username not ready" message
}

function handleLeave (io, roomId, userId) {
  console.log(`User ${userId} leaving room ${roomId}`);
  const room = rooms.get(roomId);

  // remove user from room
  room.users = rooms.get(roomId).users.filter(u => u.id !== userId);
  room.readyState.delete(userId);

  // if room is empty, delete it
  if (room.users.length === 0) {
    console.log(`Room ${roomId} is now empty. Deleting`);
    rooms.delete(roomId);
    return;
  }

  emitRoomState(io, roomId);
}

function handleSelectPass (io, roomId, userId, card) {
  let room = rooms.get(roomId);
  let passingBuffer = room.gameInfo.passing;

  // If the userId is not in passingBuffer
  if (!passingBuffer.has(userId)) {
    room.gameInfo.passing.set(userId, []);
  }

  let userCards = passingBuffer.get(userId);

  let index = 0;
  let found = false;

  for (let i = 0; i < userCards.length; i++) {
    if (userCards[i].suit === card.suit && userCards[i].value === card.value) {
      found = true;
      index = i;
    }
  }

  // User is deselecting a card from passing buffer
  if (found) {
    userCards.splice(index, 1);
    const socketId = socketIdMap.get(userId);
    io.to(socketId).emit('cardoff', {
      card: card,
    });
  }
  // User is selecting a card for the passing buffer
  else {
    // 3 cards already present within the passing buffer
    if (userCards.length >= 3) {
      return;
    }

    userCards.push(card);
    const socketId = socketIdMap.get(userId);
    io.to(socketId).emit('cardon', {
      card: card,
    });
  }
}


// GAME BUILDERS: 

function initGameState (io, roomId) {
  let deck = buildDeck();
  deck = shuffleDeck(deck);

  let room = rooms.get(roomId);
  room.gameInfo = {
    phase: 'passing',        // phase: 'passing' or 'playing' or 'done'
    hands: new Map(),        // userId -> Cards[] (13 cards for each player)
    passing: new Map(),      // userId -> Cards[] (3 cards each player wants to pass to a different player)
    trick: {                 
      cards: [],             // {userId, card} played for this trick round
      leadSuit: null,        // Lead suite played for this trick round
    },
    turn: null,              // userId -> Who plays next (Starting player has 2 of Clubs)
    heartsBroken: false,     
    roundScores: new Map(),
  };

  for (let i = 0; i < 4; i++) {
    const userId = room.users[i].id;
    let curHand = [];

    for (let j = 0; j < 13; j++) {
      curHand.push(deck[(i * 13) + j]);
      if (deck[(i * 13) + j].suit === 'C' && deck[(i * 13) + j].value === '2') {
        room.gameInfo.turn = userId;
      }
    }

    room.gameInfo.hands.set(userId, curHand);
  }


  // Emit 'deal' to each individual player (info: their hand, who's turn it is, and game phase)
  for (let i = 0; i < 4; i++) {
    const userId = room.users[i].id;
    
    const socketId = socketIdMap.get(userId);
    io.to(socketId).emit('deal', {
      hand: room.gameInfo.hands.get(userId),
      turn: room.gameInfo.turn, 
      phase: room.gameInfo.phase,
    });
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
