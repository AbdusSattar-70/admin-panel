/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */

const { createNewUser, hashPassword } = require('../utils/commonMethod');

const handleSignup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const p = hashPassword(password);
    await createNewUser({ name, email, password: p });
    res.status(200).json({ status: 'success', message: 'User Created' });
  } catch (error) {
    next(error);
  }
};

module.exports = handleSignup;