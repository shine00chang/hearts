import express from "express";

const router = express.Router();

router.get('/', (req, res) => {
    res.send('hello! from board')
});

// TODO: add in routes from README

export default router;
