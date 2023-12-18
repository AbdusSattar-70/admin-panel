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
  BLOCKED: 'Your were Blocked By Admin',
};

const generateAccessToken = (userInfo) => jwt.sign({ userInfo }, TOKEN_CONFIG.ACCESS_TOKEN_SECRET, {
  expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY,
});

const generateRefreshToken = (id) => jwt.sign({ id }, TOKEN_CONFIG.REFRESH_TOKEN_SECRET, {
  expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
});

const checkBlockedUser = (foundUser) => {
  if (!foundUser || foundUser.status === USER_STATUS.Blocked) {
    return false;
  }
  return true;
};

const authenticateUser = async (email, password) => {
  try {
    const foundUser = await User.findOne({ email });
    if (!checkBlockedUser(foundUser)) {
      return { error: MESSAGES.BLOCKED };
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return { error: MESSAGES.INVALID_CREDENTIALS };
    }

    return { user: foundUser };
  } catch (error) {
    return { error: MESSAGES.GENERIC_ERROR };
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
    sendResponse(res, 500, MESSAGES.GENERIC_ERROR);
    return null;
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      sendResponse(res, 404, MESSAGES.REQUIRED_EMAIL_PASS);
      return;
    }

    const authResult = await authenticateUser(email, password);

    if (authResult.error) {
      sendResponse(res, 400, authResult.error);
      return;
    }

    const accessToken = await generateTokensAndSetCookies(authResult.user, res);
    sendResponse(res, 201, MESSAGES.SUCCESS, accessToken);
  } catch (error) {
    sendResponse(res, 500, MESSAGES.GENERIC_ERROR);
  }
};

module.exports = handleLogin;
