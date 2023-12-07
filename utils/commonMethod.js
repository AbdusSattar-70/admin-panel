const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const User = require('../models/User.model');

const hashPassword = (password) => bcryptjs.hashSync(password, 10);
const generateJWT = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRY,
});

const createNewUser = async (userInfo) => {
  const newUser = new User(userInfo);
  await newUser.save();
  return newUser;
};

module.exports = {
  hashPassword,
  generateJWT,
  createNewUser,
};