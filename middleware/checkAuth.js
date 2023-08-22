import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const checkAuth = async (req, res, next) => {
  let token;

  if(
    req.headers.authorization && req.headers.authorization.startsWith("Bearer")
  ) {
    try {
        token = req.headers.authorization.split(' ')[1] // The .split(' ')[1] method cuts out "Bearer" and just leaves the JWT.
        //console.log(token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //console.log(decoded);

        req.user = await User.findById(decoded.id).select("-password -confirmed -token -createdAt -updatedAt -__v");
        //console.log(req.user);
    } catch (error) {
        return res.status(404).json({ msg: 'An error has ocurred' });
    }
  }

  if(!token) {
    const error = new Error('Invalid Token');
    return res.status(404).json({ msg: error.message });
  }

  next();
}

export default checkAuth;