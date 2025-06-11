const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.ACCESS_TOKEN_SECRET;

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Authorization Bearer : ', token);
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      // ① Jika memang token sudah expired:
      if (err.name === 'TokenExpiredError') {
        return res
          .status(401)
          .json({ message: 'Token expired', expired: true });
      }
      // ② Jika token lain (malformed, invalid signature, dsb):
      console.error('JWT verification error:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded;
    next();
  });
};
