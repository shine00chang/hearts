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

export function wsauth (session) 
{
  // TODO: Check signed session cookie
   
  return {
    id: 'xyz',
    username: 'turtle',
  };
}
