/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */

const { createNewUser, hashPassword, sendResponse } = require('../utils/commonMethod');

const handleSignup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const p = hashPassword(password);
    await createNewUser({ name, email, password: p });
    return sendResponse(res, 200, 'User created');
  } catch (error) {
    next(error);
  }
};

module.exports = handleSignup;