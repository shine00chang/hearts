import { Server } from 'socket.io';

export default function setWS (server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
    }
  });

  io.on('connection', socket => setSocket(socket));
}

function setSocket (socket) 
{
  const { session } = socket.handshake.auth;
  const { roomId } = socket.handshake.query;

  console.log(`user connected requesting roomId: ${roomId}, with session token: ${session}`);

  socket.on('disconnect', _ => {
    console.log('user disconnected');
  });
}
