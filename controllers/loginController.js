/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('../models/User.model');
const { generateJWTToken, sendResponse } = require('../utils/commonMethod');

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendResponse(res, 400, 'Username and password are required.');

    const foundUser = await User.findOne({ email });
    if (!foundUser) return sendResponse(res, 401, 'Invalid credentials');
    if (foundUser.status === 'blocked') return sendResponse(res, 401, 'You were blocked by admin');

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) return sendResponse(res, 401, 'Invalid credentials');

    const roles = Object.values(foundUser.roles);
    const accessToken = generateJWTToken(foundUser._id, roles, 'access');
    const refreshToken = generateJWTToken(foundUser._id, roles, 'refresh');

    const {
      password: pass, refreshToken: reToken, role, ...restInfo
    } = foundUser._doc;
    // update and save last login time and refresh token in db
    foundUser.set({ lastLoginTime: new Date(), refreshToken });
    await foundUser.save();
    res.cookie(process.env.COOKIE_SECRET, refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      maxAge: process.env.COOKIE_MAX_AGE,
    });

    return sendResponse(res, 201, 'Successfully signed in', { ...restInfo, accessToken });
  } catch (error) {
    next(error);
  }
};

module.exports = handleLogin;
