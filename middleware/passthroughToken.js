import jwt from "jsonwebtoken";

export const passthroughToken = (req, res, next) => {
  const token = req.cookies.token;
  req.userId = 0
  if (token){
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
          if (err){
         req.userId = 0
          }else{
            req.userId = payload.id;
          }
         req.userId = payload.id;
        })

  }

  next()


};
