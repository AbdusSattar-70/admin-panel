const { check, validationResult } = require('express-validator');
const User = require('../models/User.model');

// Add user
const addUserValidators = [
  check('name')
    .isLength({ min: 1 })
    .withMessage('Name is required')
    .trim(),
  check('email')
    .isEmail()
    .withMessage('Invalid email address')
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error('Email already in use');
        }
      } catch (err) {
        throw new Error(err.message);
      }
    }),
  check('password')
    .isLength({ min: 1 })
    .withMessage('Password must be at least 1 character long'),
];

const addUserValidationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    res.status(400).json({ errors: errors.array() });
  }
};

module.exports = {
  addUserValidators,
  addUserValidationHandler,
};
