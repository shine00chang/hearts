import { Server } from 'socket.io';
import { wsauth } from './auth.js';
import {
  createGame,
  addPlayerToGame,
  createRound,
  endRound,
} from './db/index.js';
import { query } from './db/database.js';

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
        'alice': true,
        'bessie': true,
        'cow': true,
    }
});
const botnames = ['alice', 'bessie', 'cow'];

const socketIdMap = new Map();

export default function setWS (server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      credentials: true,
    }
  });

  io.on('connection', socket => setSocket(socket, io));
}

async function setSocket (socket, io) 
{
  const { session } = socket.handshake.auth;
  let { roomId } = socket.handshake.query;

  const user = await wsauth(session);
  if (!user) {
    socket.emit('error', { message: 'user is not logged in' });
    socket.disconnect();
    return;
  }

  // prevent one user in multiple, or the same room.
  for (const [_, room] of rooms) {
    if (room.users.some(u => u.id == user.id)) {
      socket.emit('error', { message: `user is currently in room: ${room.id}` });
      socket.disconnect();
      return;
    }
  }

  if (typeof roomId == 'string' && roomId.length == 4) {
    console.log(`user connected requesting roomId: ${roomId}, with session token: ${session}`);
  } else {
    const genId = _ => {
      const v = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let out = "";
      do {
        out="";
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
    socket.emit('error', { message: 'Room is full' });
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
  socketIdMap.set(user.id, socket.id); // Map a new user to their socket id

  // Broadcast state whenever a new player joins
  emitRoomState(io, roomId);

  // ready, unready, leave, and disconnect event handling 
  socket.on('ready', () => handleReady(io, roomId, user.id));
  socket.on('unready', () => handleUnready(io, roomId, user.id));
  socket.on('disconnect', () => handleLeave(io, roomId, user.id));

  // game event handling
  socket.on('pass', (cards) => handlePass(io, roomId, user.id, cards));
  socket.on('play', (card) => handlePlay(io, roomId, user.id, card));
}

// EVENT HANDLERS: 
function emitRoomState (io, roomId) {
  io.to(roomId).emit('state', rooms.get(roomId));
}

async function handleReady (io, roomId, userId) {
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
    await initGameState(io, roomId);
    emitRoomState(io, roomId);
  }
}

function handleUnready (io, roomId, userId) {
  const room = rooms.get(roomId);
  room.readyState[userId] = false;

  emitRoomState(io, roomId);
}

async function handleLeave (io, roomId, userId) 
{
  console.log(`User ${userId} left room ${roomId}`);

  const room = rooms.get(roomId);

  // Can happen if one client sends a request from outdated state
  if (!room) {
    return;
  }
  const game = room.gameState;

  // If a game is in progress, mark it as 'abandoned' in db 
  if (!!game) {
    const gameId = room.gameState.dbGameId;
    try {
      await query(
        `UPDATE game SET status = 'abandoned' WHERE game_id = $1`, 
        [gameId],
      );
    } catch (err) {
      console.error('Error marking game abandoned', err);
    }

    // notify remaining clients
    const user = room.users.find(u => u.id = userId);
    io.to(roomId).emit(
      'error', 
      { message: `player ${user.username} disconnected. game cannot be restarted.` }
    );

    rooms.delete(roomId);
    return;
  }

  // remove user from room
  room.users = room.users.filter(u => u.id !== userId);
  delete room.readyState[userId];

  // if room is empty, delete it
  if (room.users.length === 0) {
    console.log(`Room ${roomId} is now empty. Deleting`);
    rooms.delete(roomId);
    return;
  }

  emitRoomState(io, roomId);
}

function handlePass (io, roomId, userId, cards) 
{
  const room = rooms.get(roomId);
  const game = room.gameState; 

  game.passes[userId] = cards;
  
  // Testing code
  for (const user of room.users) {
    if (user.id == userId) continue;
    game.passes[user.id] = game.hands[user.id].slice(0,3);
  }

  // if all players involved have selected their 3 cards, pass
  for (const user of room.users)
    if (!game.passes[user.id] || game.passes[user.id].length < 3)
      return;

  pass(io, roomId);
}

// Testing code
function fakeplay(io, roomId) 
{
  const room = rooms.get(roomId);
  const game = room.gameState;
  let card = undefined;
  if (game.leader != game.turn)
    card = game.hands[game.turn].find(card => game.trick[game.leader].charAt(0) == card.charAt(0));
  else
    card = game.hands[game.turn].find(card => card === "C2")
  if (card === undefined) {
    if (!game.heartsBroken)
      card = game.hands[game.turn].find(card => card.charAt(0) != 'H');
    else
      card = game.hands[game.turn][0];
    if (card == undefined)
      card = game.hands[game.turn][0];
  }

  console.log(`fake playing ${card} for ${game.turn}`);
  handlePlay(io, roomId, game.turn, card);
}

// Swaps cards and emits state
function pass(io, roomId)
{
  const room = rooms.get(roomId);
  const game = room.gameState;
  const users = room.users;
  const { directionMap, passes } = game;
  const direction = getPassDirection(game.roundNumber);

  // Make sure that all players involved have selected their 3 cards before passing
  for (const user of users)
    if (!passes[user.id] || passes[user.id].length < 3)
      return;

  // Construct pass map
  const passMap = {}
  if (direction == 'right')
    for (let i=0; i<4; i++)
      passMap[directionMap[i]] = directionMap[(i+1)%4];
  if (direction == 'left')
    for (let i=0; i<4; i++)
      passMap[directionMap[i]] = directionMap[(i+3)%4];
  if (direction == 'across')
    for (let i=0; i<4; i++)
      passMap[directionMap[i]] = directionMap[(i+2)%4];

  // Remove passed cards
  for (const user of users) {
    game.hands[user.id] = game.hands[user.id].filter(card => !passes[user.id].includes(card));
  }

  // Add cards
  for (const [a, b] of Object.entries(passMap)) {
    game.hands[b].push(...passes[a]);
  }

  game.passing = false;

  console.log(game);

  // Start trick
  firstTrick(io, roomId);
  emitRoomState(io, roomId);
  return;
}

function firstTrick(io, roomId) 
{
  const room = rooms.get(roomId);
  const game = room.gameState;
  const users = room.users;

  let leader;
  for (const user of users)
    if (game.hands[user.id].includes("C2"))
      leader = user.id;

  game.turn = leader;
  game.leader = leader;
  
  // Testing code:
  if (roomId === 'TEST' && botnames.includes(leader))
    setTimeout(_ => fakeplay(io, roomId), 3000);
}

function handlePlay (io, roomId, userId, card) 
{
  console.log('someone played: ', userId, card);

  const room = rooms.get(roomId);
  const game = room.gameState;
  const leader = game.leader;

  // If its the first round, the leader must play C2
  console.log(game.roundNumber)
  if (game.hands[userId].length === 13 && userId === leader && card !== "C2") {
    io.to(socketIdMap.get(userId)).emit('illegalmove');
    return;
  }

  // Check if turn
  if (userId !== game.turn) {
    io.to(socketIdMap.get(userId)).emit('illegalmove');
    return;
  }
  // Check if card in hand
  const hasCard = game.hands[userId].some(c => c === card);
  if (!hasCard) {
    io.to(socketIdMap.get(userId)).emit('illegalmove');
    return;
  }
  // Card must follow suit if possible
  if (leader !== userId) {
    if (game.trick[leader][0] !== card[0]) {
      const hasSuit = game.hands[userId].some(c => c[0] === game.trick[leader][0]);
      if (hasSuit) {
        io.to(socketIdMap.get(userId)).emit('illegalmove');
        return;
      }
    }
  }
  // Cannot lead hearts until hearts are broken
  if (userId === leader && card[0] === 'H' && !game.heartsBroken) {
    const hasNonHeart = game.hands[userId].some(c => c[0] !== 'H');
    if (hasNonHeart) {
      io.to(socketIdMap.get(userId)).emit('illegalmove');
      return;
    }

    game.heartsBroken = true;
  }

  // Remove card from hand
  game.hands[userId] = game.hands[userId].filter(i => i != card);

  // set trick
  game.trick[userId] = card;

  // find next turn
  game.turn = game.directionMap[(game.directionMap.indexOf(game.turn)+1)%4];

  // Testing code
  if (Object.keys(game.trick).length != 4 && roomId === 'TEST' && botnames.includes(game.turn))
    setTimeout(_ => fakeplay(io, roomId), 1000);

  // check trick end
  if (Object.keys(game.trick).length == 4) {
    const store = game.turn;
    game.turn = userId;

    setTimeout(_ => {
      game.turn = store;
      trickend(io, roomId);
      emitRoomState(io, roomId);
    }, 1000);
  }

  emitRoomState(io, roomId);
}

function trickend(io, roomId) 
{
  const room = rooms.get(roomId);
  const game = room.gameState;
  const users = room.users;
  const trickCards = game.trick;

  // Find winner of current trick
  const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const leader = game.leader;
  const leadCard = trickCards[leader];

  let winner = leader;

  for (const player of users) {
    const playerCard = trickCards[player.id];
    const playerSuite = playerCard[0];
    const playerValue = playerCard.substring(1);

    const winnerValue = trickCards[winner].substring(1);

    if (playerSuite === leadCard[0] && cardValues.indexOf(playerValue) > cardValues.indexOf(winnerValue)) {
      winner = player.id;
    }
  }

  // Winner of the trick is the leader of the next trick
  game.leader = winner;
  game.turn = winner;

  // Updating roundPoints
  let heartCount = 0;
  let qSpades = false;

  for (const user of users) {
    const userCard = trickCards[user.id];

    if (userCard[0] === 'H') {
      heartCount++;
    }
    
    if (userCard === 'SQ') {
      qSpades = true;
    }
  }

  // Hearts broken if any hearts has been played
  if (heartCount > 0) {
    game.heartsBroken = true;
  }

  const points = heartCount + 13 * qSpades;
  game.roundPoints[winner] += points;

  game.trick = {};

  // check round end
  // calculates if all hands empty
  if (Object.entries(game.hands).reduce((a, [k, v]) => a + v.length, 0) == 0) {
    roundend(io, roomId);
    return;
  }

  if (roomId == 'TEST' && botnames.includes(game.turn))
    setTimeout(_ => fakeplay(io, roomId), 1000);
}

async function roundend(io, roomId)
{
  const room = rooms.get(roomId);
  const game = room.gameState;
  const users = room.users;
  const threshold = 20;

  // create round row for the round that just ended
  const roundRow = await createRound(game.dbGameId, game.roundNumber);
  const roundId = roundRow.round_id;

  // send per-player scores for this round and then reset
  for (const u of users) {
    const roundScore = game.roundPoints[u.id];
    await endRound(roundId, u.username, roundScore);
    //game.roundPoints[u.id] = 0;
  }

  resolvePoints(roomId, threshold);
  
  // send per-player scores for this round and then reset

  emitRoomState(io, roomId);

  // NOTE: For frontend, let's update the state after some timeout. This way, the frontend will see a 'round end'
  // state for a moment, which it then shows the round end screen for a while (say, 5s), after which it will see the
  // state has been updated to a new round, and it will exit out of that screen

  setTimeout(_ => {
    // NOTE: so here is where we'd update the state

    // Check game end before rebuilding
    // NOTE: 20 point limit for testing
    if (Object.values(game.points).some(x => x > 20)) {
      gameend(io, roomId);
      emitRoomState(io, roomId);
      return;
    }

    // Rebuild for next round
    game.roundNumber++;
    const deck = shuffleDeck(buildDeck());

    for (const [i, user] of room.users.entries()) {
      const hand = [];

      for (let j = 0; j < 13; j++) {
        hand.push(deck[(i * 13) + j]);
        if (deck[(i * 13) + j] == 'C2') {
          game.turn = user.id;
          game.leader = user.id;
        }
      }

      game.hands[user.id] = hand;
    }

    game.passDirection = getPassDirection(game.roundNumber);
    game.passing = (game.passDirection !== 'hold');
    game.passes = {};
    game.trick = {};
    game.heartsBroken = false;

    // Frontend should see new round
    emitRoomState(io, roomId);
  }, 5000);
}

async function gameend(io, roomId)
{
  const room = rooms.get(roomId);
  const game = room.gameState;
  const gameId = game.dbGameId;

  game.over = true;
  try {
    // Mark game as done
    await query(
      `UPDATE game SET status = 'done' WHERE game_id = $1`,
      [gameId],
    );
  } catch (err) {
    console.error("Error sending game result to db", err);
  }
}

// GAME BUILDERS: 

// Creates the game state object
async function initGameState (io, roomId) {
  const room = rooms.get(roomId);

  // Create DB game once at game start (Game already marked as 'in-progress')
  const gameRow = await createGame();
  const gameId = gameRow.game_id;

  // Map players to this game
  for (const [seat, user] of room.users.entries()){
    await addPlayerToGame(gameId, user.username, seat);
  }

  room.gameState = {
    hands: {},        // userId -> Cards[] (13 cards for each player)
    passing: true,
    passes: {},      // userId -> Cards[] (3 cards each player wants to pass to a different player)
    passDirection: getPassDirection(1),
    trick: {},            // {userId, card} played for this trick round
    leader: undefined,        // Lead suite played for this trick round
    turn: undefined,              // userId -> Who plays next (Starting player has 2 of Clubs)
    heartsBroken: false,     
    roundPoints: {},
    points: {},
    roundNumber: 1,
    directionMap: room.users.map(user => user.id),

    dbGameId: gameId,
  };

  let deck = shuffleDeck(buildDeck());

  // for each user
  for (const [ i, user ] of room.users.entries()) {
  
    // create hand
    let hand = [];

    for (let j = 0; j < 13; j++) {
      hand.push(deck[(i * 13) + j]);
      if (deck[(i * 13) + j] === 'C2') {
        room.gameState.turn = user.id;
      }
    }
    room.gameState.hands[user.id] = hand;
    room.gameState.points[user.id] = 0;
    room.gameState.roundPoints[user.id] = 0;
  }
}

function buildDeck () {
  const deck = [];

  const suites = ['H', 'D', 'C', 'S'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  for (let i = 0; i < suites.length; i++) {
    for (let j = 0; j < values.length; j++) {
      deck[(i * 13) + j] = suites[i] + values[j];
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

function resolvePoints (roomId, threshold) {
  const room = rooms.get(roomId);
  const game = room.gameState;
  const users = room.users;
  const shooter = users.find(u => game.roundPoints[u.id] === 26);

  if (!shooter) {
    // No player earned all 26 points (no shoot/normal scoring)

    for (const user of users) {
      game.points[user.id] += game.roundPoints[user.id];
      game.roundPoints[user.id] = 0;
    }
    return;
  }

  /*
   * Optimal implementation of shooting the moon scoring for the player
   * No frontend communication needed
   * 
   * Player has two choices in shooting the moon: 
   * 1) Add 26 points to all other scores
   * 2) Subtract 26 points from their own score
   * 
   * Player should only add 26 points to all other scores if either the 
   * game does not end or the game does end but with the shooter winning
   */ 

  // Simulate adding 26 to all non-shooter players
  const simulated = {};

  for (const user of users) {
    simulated[user.id] = game.points[user.id] + (user.id !== shooter.id ? 26 : 0);
  }

  const gameEndsIfAdd = users.some(u => simulated[u.id] >= threshold);
  const shooterWinsIfAdd = !users.some(u => simulated[u.id] < simulated[shooter.id]);

  if (!gameEndsIfAdd || shooterWinsIfAdd) {
    // Safe to add 26 points to all non-shooter players
    for (const user of users) {
      if (user.id !== shooter.id) {
        game.points[user.id] += 26;
      }
    }
  }
  else {
    game.points[shooter.id] -= 26;
  }
}
