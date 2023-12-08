/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
const User = require('../models/User.model');
const { generateJWTToken, verifyToken } = require('../utils/commonMethod');
require('dotenv').config();

const handleRefreshToken = async (req, res, next) => {
  try {
    const { cookies } = req;

    if (!cookies?.cookie_access) return res.sendStatus(401);
    const refreshToken = cookies.cookie_access;

    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) return res.sendStatus(403); // Forbidden

    const decoded = await verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (foundUser._id.toString() !== decoded.userInfo.id) {
      return res.sendStatus(403); // Invalid or mismatched token
    }

    const roles = Object.values(foundUser.roles);
    const accessToken = generateJWTToken(foundUser._id, roles, 'access');
    res.json({ accessToken });
  } catch (error) {
    res.sendStatus(403); // Invalid token or other error
    next(error);
  }
};

module.exports = handleRefreshToken;
