const express = require('express');
const handleLogin = require('../controllers/loginController');
const handleSignup = require('../controllers/registerController');
const { addUserValidators, addUserValidationHandler } = require('../middleware/userValidators');
const handleRefreshToken = require('../controllers/refreshTokenController');
const handleLogout = require('../controllers/logoutController');

const router = express.Router();
// router.post('/google', google);
router.post('/liveValidate', addUserValidators, addUserValidationHandler);
router.post('/signup', addUserValidators, addUserValidationHandler, handleSignup);
router.post('/signin', handleLogin);
router.get('/refresh', handleRefreshToken);
router.get('/signout', handleLogout);

module.exports = router;