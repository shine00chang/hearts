import { Server } from 'socket.io';

// Mock room storage (Change to appropriate db queries later)
const rooms = new Map();

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
  const { roomId } = socket.handshake.query;

  // TODO: Add authentication features
  // TODO: Extract userId from session token (Depending on how frontend implements)
  let currentUserId; // Mock for now

  console.log(`user connected requesting roomId: ${roomId}, with session token: ${session}`);

  // TODO: Add a 4 player limit check

  socket.join(roomId);

  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: [],
      readyState: new Map()
    });
  }

  const room = rooms.get(roomId);
  const userData = {
    userId: currentUserId,
    socketId: socket.id,
    username: 'Player' // Get actual username from database
  };
  
  room.users.push(userData);
  room.readyState.set(currentUserId, false); // All players start as 'not ready' after joining room

  // Broadcast state whenever a new player joins
  emitRoomState(io, roomId);

  // ready + unready event handling 
  socket.on('ready', () => handleReady(io, roomId, currentUserId));
  socket.on('unready', () => handleUnready(io, roomId, currentUserId));

  // TODO: Handle leave + disconnect events

  socket.on('disconnect', _ => {
    console.log('user disconnected');
  });
}

function emitRoomState (io, roomId) {
  io.to(roomId).emit('users', rooms.get(roomId).users);
  io.to(roomId).emit('readystate', Array.from(rooms.get(roomId).readyState.entries()))
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
      console.log(`Start a game in room ${roomId}`)
    }
  }
}

function handleUnready (io, roomId, userId) {
  const curRoom = rooms.get(roomId);
  curRoom.readyState.set(userId, false);
  emitRoomState(io, roomId); // Display some "player_username not ready" message
}
