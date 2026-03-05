import express from "express";
import * as db from "../../db/index.js"

const router = express.Router();

router.get('/', (req, res) => {
    res.send('hello! from board')
});

router.get('/get', async (req, res) => {
  return res.json(await db.getLeaderboard())
});

export default router;
