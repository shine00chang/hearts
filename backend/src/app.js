import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';

import userRouter from './routes/user/router.js';
import gameRouter from './routes/game/router.js';
import roomRouter from './routes/room/router.js';
import boardRouter from './routes/board/router.js';

import setWS from './ws.js';

const app = express();
const server = createServer(app);
setWS(server);

const PORT = 3000;

// Adds headers: Access-Control-Allow-Origin: *
// Necessary because client is served by a different origin
app.use(cors())

app.use('/user', userRouter);
app.use('/game', gameRouter);
app.use('/room', roomRouter);
app.use('/board', boardRouter);

app.get('/', (res, req) => {
  return req
    .status(200)
    .send("app is healthy");
});

server.listen(PORT, _ => {
  console.log('App started on port ', PORT)
})
