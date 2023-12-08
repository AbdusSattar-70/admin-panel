const ROLES_LIST = {
  Admin: 1000,
  User: 2000,
  Editor: 3000,
};

const TOKEN_NAME = {
  Access: 1000,
  Refresh: 2000,
};
const USER_STATUS = {
  Blocked: 'blocked',
  Active: 'active',
};

const TOKEN_CONFIG = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  COOKIE_MAX_AGE: process.env.COOKIE_MAX_AGE,
};

module.exports = {
  ROLES_LIST, TOKEN_NAME, USER_STATUS, TOKEN_CONFIG,
};