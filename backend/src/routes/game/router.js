import express from "express";
import auth from "../../auth.js"
import * as db from "../../db/index.js"

const router = express.Router();

async function getGames(req, res) {
  const username = req.query.username;  
  return (res.json(await db.getUserGames(username)) || null);
};

router.get('/', (req, res) => {
    res.send('hello! from game')
});

router.get('/search', getGames)

export default router;
