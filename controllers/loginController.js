/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User.model');

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Username and password are required.' });

    const foundUser = await User.findOne({ email });
    // generic message for security purpose
    if (!foundUser) return res.status(401).json({ message: 'Invalid credentials' });

    if (foundUser.status === 'blocked') return res.status(401).json({ message: 'You were blocked by admin' });

    // Evaluate password
    const match = await bcrypt.compare(password, foundUser.password);
    // generic message for security purpose
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // Create JWTs
    const roles = Object.values(foundUser.role);
    const userInfo = { id: foundUser._id, roles };

    const accessToken = jwt.sign(
      { userInfo }, process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );

    const refreshToken = jwt.sign(
      { userInfo }, process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
    );

    // Save refreshToken and update lastLoginTime
    foundUser.set({ lastLoginTime: new Date(), refreshToken });
    await foundUser.save();

    const {
      password: pass, refreshToken: reToken, role, ...restInfo
    } = foundUser._doc;
    res.cookie(process.env.COOKIE_SECRET, refreshToken, {
      signed: true,
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: process.env.COOKIE_MAX_AGE,
    }).status(201).json({
      status: 201,
      message: 'Successfully signed in',
      data: { ...restInfo, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = handleLogin;
