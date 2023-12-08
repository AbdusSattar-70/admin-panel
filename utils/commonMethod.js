const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User.model');

const hashPassword = (password) => bcryptjs.hashSync(password, 10);

const generateJWTToken = (userId, roles, tokenType) => {
  const secret = (tokenType === 'access')
    ? process.env.ACCESS_TOKEN_SECRET
    : process.env.REFRESH_TOKEN_SECRET;

  const expiresIn = (tokenType === 'access')
    ? process.env.ACCESS_TOKEN_EXPIRY
    : process.env.REFRESH_TOKEN_EXPIRY;

  return jwt.sign(
    {
      userInfo: {
        id: userId,
        roles,
      },
    },
    secret,
    { expiresIn },
  );
};

const verifyToken = (token, secret) => new Promise((resolve, reject) => {
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      reject(err);
    } else {
      resolve(decoded);
    }
  });
});

const createNewUser = async (userInfo) => {
  const newUser = new User(userInfo);
  await newUser.save();
  return newUser;
};

const sendResponse = (res, status, message, data = null) => res.status(status).json({
  status,
  message,
  data,
});

const toggleUserStatus = async (userId) => {
  try {
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      throw new Error('User not found');
    }

    // Toggle between 'blocked' and 'active'
    const newStatus = foundUser.status === 'blocked' ? 'active' : 'blocked';

    await User.findByIdAndUpdate(userId, { status: newStatus });
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  hashPassword,
  generateJWTToken,
  verifyToken,
  createNewUser,
  sendResponse,
  toggleUserStatus,
};
