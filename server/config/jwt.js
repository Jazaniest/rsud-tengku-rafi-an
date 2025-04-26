// server/config/jwt.js
module.exports = {
    secret: process.env.JWT_SECRET || 'mysecretkey',
    accessTokenExpiry: '100000000000000000000000000000000000000000000000000000000000h', 
  };  