const express = require('express');

const adminRouter = express.Router();

const {
  handleAdminPanel,
  getUsers,
  deleteUser,
  deleteUsers,
  updateUsersBlock,
  updateUsersUnblock,
} = require('../controllers/adminController');

// Route for accessing the admin panel
adminRouter.get('/', handleAdminPanel);

// get all users
adminRouter.get('/users', getUsers);

// Route for updating user status block( single or multiple)
adminRouter.patch('/block', updateUsersBlock);

// Route for updating user status unblock( single or multiple)
adminRouter.patch('/active', updateUsersUnblock);
// Route for delete a single user
adminRouter.delete('/delete/:userId', deleteUser);
// Route for delete multiple users
adminRouter.delete('/delete', deleteUsers);

module.exports = adminRouter;
