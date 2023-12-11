/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
require('dotenv').config();

const handleRefreshToken = async (req, res, next) => {
  try {
    const { cookies } = req;
    if (!cookies?.cookie_access) return res.sendStatus(401);
    const refreshToken = cookies.cookie_access;
    res.clearCookie('cookie_access', { httpOnly: true, sameSite: 'None', secure: true });

    const foundUser = await User.findOne({ refreshToken }).exec();

    // Detected refresh token reuse!
    if (!foundUser) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) return res.sendStatus(403); // Forbidden
          const hackedUser = await User.findOne({ _id: decoded.id }).exec();
          hackedUser.refreshToken = [];
          await hackedUser.save();
        },
      );
      return res.sendStatus(403); // Forbidden
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter((rt) => rt !== refreshToken);

    // evaluate jwt
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          foundUser.refreshToken = [...newRefreshTokenArray];
          await foundUser.save();
        }
        if (err || foundUser._id !== decoded.id) return res.sendStatus(403);

        // Refresh token was still valid
        const { status, _id: id } = foundUser;
        const accessToken = jwt.sign(
          {
            userInfo: {
              id,
              status,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
        );

        const newRefreshToken = jwt.sign(
          { id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        await foundUser.save();

        // Creates Secure Cookie with refresh token
        res.cookie('cookie_access', newRefreshToken, {
          httpOnly: true, secure: true, sameSite: 'None', maxAge: process.env.COOKIE_MAX_AGE,
        });

        res.json({ id, status, accessToken });
      },
    );
  } catch (error) {
    next(error);
  }
};

module.exports = handleRefreshToken;
