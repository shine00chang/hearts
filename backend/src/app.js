import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import cookieParser  from 'cookie-parser'
import * as crypto from 'crypto'
import auth, { register, login } from './auth.js';

import userRouter from './routes/user/router.js';
import gameRouter from './routes/game/router.js';
import roomRouter from './routes/room/router.js';
import boardRouter from './routes/board/router.js';

import setWS from './ws.js';

const secret = crypto.randomBytes(16).toString('hex');

const app = express();
app.use(cookieParser(secret))
app.use(express.json())
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
