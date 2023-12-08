/* eslint-disable consistent-return */
const User = require('../models/User.model');
require('dotenv').config();

const handleLogout = async (req, res, next) => {
  // On client, also delete the accessToken
  try {
    const { cookies } = req;
    if (!cookies?.cookie_access) return res.sendStatus(204); // No content
    const refreshToken = cookies.cookie_access;

    // Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken });

    if (!foundUser) {
      res.clearCookie(process.env.COOKIE_SECRET, { httpOnly: true, sameSite: 'None', secure: true });
      return res.sendStatus(204);
    }

    // Delete refreshToken in db
    foundUser.refreshToken = '';
    await foundUser.save();

    res.clearCookie(process.env.COOKIE_SECRET, { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

module.exports = handleLogout;