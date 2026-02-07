import { checkSession } from "db.js"

export default function auth (req, res, next) 
{
  // TODO: Check signed session cookie
  const authed = true;

  if (!authed)
    return res
      .status(403)
      .send("unauthorized");
  
  next()
}
