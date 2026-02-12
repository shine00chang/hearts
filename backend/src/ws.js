import { Server } from 'socket.io';
import { wsauth } from './auth.js';

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

  // Broadcast state whenever a new player joins
  emitRoomState(io, roomId);

  // ready + unready event handling 
  socket.on('ready', () => handleReady(io, roomId, user.id));
  socket.on('unready', () => handleUnready(io, roomId, user.id));

  // TODO: Handle leave event

  socket.on('disconnect', _ => {
    // TODO: remove from room
    console.log('user disconnected');
  });
}

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
      console.log(`Start a game in room ${roomId}`)
    }
  }
}

function handleUnready (io, roomId, userId) {
  const curRoom = rooms.get(roomId);
  curRoom.readyState.set(userId, false);
  emitRoomState(io, roomId); // Display some "player_username not ready" message
}
