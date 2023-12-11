/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
// loginController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User.model');
const { sendResponse } = require('../utils/commonMethod');
const { USER_STATUS, TOKEN_CONFIG } = require('../config/token&CommonVar');
const { setCookie, clearPreviousRefreshTokens } = require('../utils/commonMethod');

const MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  GENERIC_ERROR: 'Error occurred',
  REQUIRED_EMAIL_PASS: 'Username and password are required.',
  SUCCESS: 'Successfully signed in',
};

const generateAccessToken = (userInfo) => jwt.sign({ userInfo }, TOKEN_CONFIG.ACCESS_TOKEN_SECRET, {
  expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY,
});

const generateRefreshToken = (id) => jwt.sign({ id }, TOKEN_CONFIG.REFRESH_TOKEN_SECRET, {
  expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
});

const checkBlockedUser = (foundUser) => {
  if (!foundUser || foundUser.status === USER_STATUS.Blocked) {
    throw new Error(MESSAGES.INVALID_CREDENTIALS);
  }
};

const authenticateUser = async (email, password) => {
  try {
    const foundUser = await User.findOne({ email });
    checkBlockedUser(foundUser);

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      throw new Error(MESSAGES.INVALID_CREDENTIALS);
    }

    return foundUser;
  } catch (error) {
    throw new Error(MESSAGES.GENERIC_ERROR);
  }
};

const generateTokensAndSetCookies = async (foundUser, res) => {
  try {
    const { cookies } = res;
    const { status, _id: id } = foundUser;
    const accessToken = generateAccessToken({
      id,
      status,
    });

    const newRefreshToken = generateRefreshToken(id);

    await clearPreviousRefreshTokens(cookies, foundUser, res);

    foundUser.refreshToken.push(newRefreshToken);
    foundUser.lastLoginTime = new Date();
    await foundUser.save();

    setCookie(res, newRefreshToken);

    return { accessToken, status, id };
  } catch (error) {
    throw new Error(MESSAGES.GENERIC_ERROR);
  }
};

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendResponse(res, 400, MESSAGES.REQUIRED_EMAIL_PASS);

    const foundUser = await authenticateUser(email, password);
    const accessToken = await generateTokensAndSetCookies(foundUser, res);

    return sendResponse(res, 201, MESSAGES.SUCCESS, accessToken);
  } catch (error) {
    next(error);
  }
};

module.exports = handleLogin;
