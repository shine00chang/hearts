import * as db from "./db/index.js"
import cookieParser from "cookie-parser"
import bcrypt from "bcrypt"
import crypto from "crypto"

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function passwordCheck(password, hashed_password) { 
  return await bcrypt.compare(password, hashed_password)
}

export default async function auth (req, res, next) {
  let authed = false;
  console.log(req.cookies);
  if (typeof req.cookies.sessionid === 'string') {
    console.log(req.cookies);
    db.deleteOldSessions()
    const session = await db.getSession(req.cookies.sessionid)
    if (session) {
      req.user = await db.getUser(session.user_id, false);
      delete req.user.password_hash
      authed = true;
    }
  }

  if (!authed) {
    res.clearCookie('sessionid')
    console.log('auth said they are unauthorized')
    return res.status(403).send("unauthorized");
  }

  next();
}

export async function register (req, res) {
  const username = req.body.username
  const password = req.body.password

  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).send('please provide a username/password');
  }

  if (await db.getUser(username)) {
    return res.status(400).send('username already exists, use a different one')
  }

  if (!await db.createUser(username, await hashPassword(password))) {
    return res.status(400).send("registration failed")
  }
  res.status(200).send("registration successful")
}

export async function login (req, res) {
  const username = req.body.username
  const password = req.body.password

  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).send('please provide a username/password');
  }
  const user = await db.getUser(username)
  if (!user) {
    return res.status(404).send('user does not exist, try registering first');
  }
  if (!(await passwordCheck(password, user.password_hash))) {
    return res.status(401).send('invalid password');
  }
  const sessionId = crypto.randomUUID();
  await db.createSessionTable()
  await db.createSession(sessionId, user.id)
  res.cookie('sessionid', sessionId, { signed: false});
  res.redirect('/');
}

export async function logout (req, res) {
  const sessionId = req.cookies.sessionid;
  if (sessionId) {
    await db.deleteSession(sessionId)
  } else {
    console.error("logout from authed user, but has no session id in cookie?")
  }
  res.clearCookie('sessionid')
  res.status(200).send("logout success")
}

export async function wsauth (sessionId) {
  const session = await db.getSession(sessionId)
  if (session) {
    const user = await db.getUser(session.user_id, false);
    delete user.password_hash;
    return user;
  }

  return null;
}

