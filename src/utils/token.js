const jwt = require("jsonwebtoken");


// Short-lived token used to authorize protected API calls.
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

// Long-lived token used to renew sessions and stored hashed in the database.
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};


module.exports = { generateAccessToken, generateRefreshToken };
