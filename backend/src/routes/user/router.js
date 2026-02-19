import express from "express";
import auth from "../../auth.js";

const router = express.Router();

router.get('/', auth, (req, res) => {
  console.log(req.user);
  return res.json(req.user);
});

// TODO: add in routes from README

export default router;
