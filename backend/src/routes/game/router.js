import express from "express";
import auth from "../../auth.js"
import * as db from "../../db/index.js"

const router = express.Router();

async function ownGames(req, res) {
  const userId = req.user.id;  
  return res.json(db.getUserGames(userId))
};

router.get('/', (req, res) => {
    res.send('hello! from game')
});

router.get('/own', auth, ownGames)

export default router;
