import express from "express";
import auth, { register, login, logout } from "../../auth.js";

const router = express.Router();

router.get('/', auth, (req, res) => {
  console.log(req.user);
  return res.json(req.user); // this techincally has the hash but if someone reverses the hash function from this i will be impressed
});

router.post('/create', register)
router.post('/login', login)
router.post('/logout', auth, logout)

export default router;
