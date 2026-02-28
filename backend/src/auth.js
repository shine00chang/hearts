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
  if (typeof req.signedCookies.sessionid === 'string') {
    db.deleteOldSessions()
    const session = await db.getSession(req.signedCookies.sessionid)
    if (session) {
      req.user = await db.getUser(session.user_id, false);
      authed = true;
    }
  }

  if (!authed)
  return res.status(403).send("unauthorized");

  next();
}

export async function register (req, res) {
  const username = req.body.username
  const password = req.body.password

  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.send('please provide a username/password');
  }

  if (await db.getUser(username)) {
    return res.send('username already exists, use a different one')
  }

  if (!await db.createUser(username, await hashPassword(password))) {
    return res.send("registration failed")
  }
  res.send("registration successful")
}

export async function login (req, res) {
  const username = req.body.username
  const password = req.body.password

  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.send('please provide a username/password');
  }
  const user = await db.getUser(username)
  if (!user) {
    return res.send('user does not exist, try registering first');
  }
  if (!(await passwordCheck(password, user.password_hash))) {
    return res.send('invalid password');
  }
  const sessionId = crypto.randomUUID();
  await db.createSessionTable()
  await db.createSession(sessionId, user.id)
  res.cookie('sessionid', sessionId, { signed: true});
  res.redirect('/');
}

export function wsauth (session) 
{
  // TODO: Check signed session cookie
  return {
    id: 'xyz',
    username: 'not authed',
  };
}
