import * as db from "./db/index.js"
import cookieParser from "cookie-parser"
import bcrypt from "bcrypt"

export function hashPassword(password) {
   return bcrypt.hash(password, 10);
}

export function passwordCheck(password, hashed_password) { 
  return hashed_password === hashPassword(password)
}

export default function auth (req, res, next) {
  let authed = true;
/*
  if (typeof req.signedCookies.username === 'string') {
    if (users.has(req.signedCookies.username)) {
      res.locals.user = users.get(req.signedCookies.username);
      authed = true;
    }
  }
*/
  if (!authed)
    return res
      .status(403)
      .send("unauthorized");

  req.user = {
    id: 'xyz',
    username: 'turtle',
  };
  next();
}

export function wsauth (session) 
{
  // TODO: Check signed session cookie
   
  return {
    id: 'xyz',
    username: 'turtle',
  };
}



