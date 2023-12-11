/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */

const { createNewUser, hashPassword, sendResponse } = require('../utils/commonMethod');

const handleSignup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input data
    if (!name || !email || !password) {
      return sendResponse(res, 400, 'Invalid input. Name, email, and password are required.');
    }

    const hashedPassword = hashPassword(password);

    // Perform user creation
    await createNewUser({ name, email, password: hashedPassword });

    // Send success response
    return sendResponse(res, 200, 'User created successfully');
  } catch (error) {
    sendResponse(res, 500, String(error));
    next(error);
  }
};

module.exports = handleSignup;
