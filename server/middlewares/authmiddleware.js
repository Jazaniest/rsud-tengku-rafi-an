// server/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const secret = 'mysecretkey'; // pastikan ini konsisten

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader); // Debug logging
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded; // berisi id dan role
    // console.log('ini isi decoded : ', req.user);
    next();
  });
};
