const express = require('express');

const adminRouter = express.Router();

const {
  handleAdminPanel,
  getUsers,
  updateUser,
  updateUsers,
  deleteUser,
  deleteUsers,
} = require('../controllers/adminController');

// Route for accessing the admin panel
adminRouter.get('/', handleAdminPanel);

// get all users
adminRouter.get('/users', getUsers);

// Route for updating user status (single  user)
adminRouter.patch('/update/:userId', updateUser);

// Route for updating multiple users status ( multiple users)
adminRouter.patch('/update', updateUsers);
// Route for delete a single user
adminRouter.delete('/delete/:userId', deleteUser);
// Route for delete multiple users
adminRouter.delete('/delete/', deleteUsers);

module.exports = adminRouter;
