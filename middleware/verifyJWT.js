/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
const { TOKEN_CONFIG } = require('../config/token&CommonVar');
const { verifyAccessToken } = require('../utils/commonMethod');
require('dotenv').config();

const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];
    const decoded = await verifyAccessToken(token, TOKEN_CONFIG.ACCESS_TOKEN_SECRET);

    req.user = decoded.userInfo.id;
    req.roles = decoded.userInfo.roles;

    next();
  } catch (error) {
    res.sendStatus(403); // Invalid token or other error
  }
};

module.exports = verifyJWT;