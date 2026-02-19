import * as db from "db/index.js"
import { cookieParser } from "cookie-parser"
import { bcrypt } from "bcrypt"

export default function hashPassword(password) {
   return bcrypt.hash(password, 10);
}

export default function passwordCheck(password, hashed_password) { 
  return hashed_password === hashPassword(password)
}

export default function auth (req, res, next) {
  var authed = false;
  if (typeof req.signedCookies.username === 'string') {
    if (users.has(req.signedCookies.username)) {
      res.locals.user = users.get(req.signedCookies.username);
      authed = true;
    }
  }
  if (!authed)
    return res
      .status(403)
      .send("unauthorized");

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



