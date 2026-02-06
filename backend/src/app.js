import express from 'express';

import userRouter from './routes/user/router.js';
import gameRouter from './routes/game/router.js';
import roomRouter from './routes/room/router.js';
import boardRouter from './routes/board/router.js';

const app = express();
const PORT = 3000;

app.use('/user', userRouter);
app.use('/game', gameRouter);
app.use('/room', roomRouter);
app.use('/board', boardRouter);

app.get('/', (res, req) => {
    return req
        .status(200)
        .send("app is healthy");
});

app.listen(PORT, () => {
    console.log('App started on port ', PORT)
})
