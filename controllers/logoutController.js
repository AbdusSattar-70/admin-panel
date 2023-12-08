/* eslint-disable consistent-return */
// logoutController.js
const User = require('../models/User.model');
const { TOKEN_CONFIG } = require('../config/token&CommonVar');
const { clearRefreshToken } = require('../utils/commonMethod');
require('dotenv').config();

const handleLogout = async (req, res, next) => {
  try {
    const { cookies } = req;
    if (!cookies?.TOKEN_CONFIG.COOKIE_SECRET) return res.sendStatus(204);

    const refreshToken = cookies.TOKEN_CONFIG.COOKIE_SECRET;
    const foundUser = await User.findOne({ refreshToken }).exec();

    if (!foundUser) {
      clearRefreshToken(res, TOKEN_CONFIG.COOKIE_SECRET);
      return res.sendStatus(204);
    }

    foundUser.refreshToken = foundUser.refreshToken.filter((rt) => rt !== refreshToken);
    await foundUser.save();

    clearRefreshToken(res, TOKEN_CONFIG.COOKIE_SECRET);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

module.exports = handleLogout;
