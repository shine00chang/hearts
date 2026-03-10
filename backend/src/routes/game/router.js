import express from "express";
import auth from "../../auth.js"
import * as db from "../../db/index.js"

const router = express.Router();

async function getGames(req, res) {
  const username = req.query.username;  
  return (res.json(await db.getUserGames(username)) || null);
};

async function getOwnGames(req, res) {
  const username = req.user.username;
  const games = (await db.getUserGames(username) || null);
  return res.json({
    username: username,
    games: games
  });
}

router.get('/', (req, res) => {
  res.send('hello! from game')
});

router.get('/search', getGames)
router.get('/own', auth, getOwnGames)

export default router;
