import express from "express";
import auth, { register, login, logout } from "../../auth.js";

const router = express.Router();

router.get('/', auth, (req, res) => {
  console.log(req.user);
  return res.status(200).json(req.user);
});

router.post('/create', register)
router.post('/login', login)
router.post('/logout', auth, logout)

export default router;
