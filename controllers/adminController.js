/* eslint-disable consistent-return */
const User = require('../models/User.model');
const { sendResponse, toggleUserStatus } = require('../utils/commonMethod');

const handleAdminPanel = async (req, res, next) => {
  try {
    const userId = req.user;
    const validUser = await User.findOne({ _id: userId });

    if (!validUser) {
      return sendResponse(res, 404, 'User not found');
    }

    if (validUser.status === 'blocked') {
      return sendResponse(res, 404, 'User is blocked');
    }

    sendResponse(res, 200, 'Admin Panel accessed successfully');
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const foundUsers = await User.find().select('-password -refreshToken -roles');
    sendResponse(res, 200, 'All users fetched successfully', foundUsers);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await toggleUserStatus(userId);

    sendResponse(res, 200, 'User status toggled successfully');
  } catch (err) {
    next(err);
  }
};

const updateUsers = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    // parallelize the asynchronous operations
    await Promise.all(userIds.map((userId) => toggleUserStatus(userId)));

    sendResponse(res, 200, 'Users status toggled successfully');
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);

    sendResponse(res, 200, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};

const deleteUsers = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    await User.deleteMany({ _id: { $in: userIds } });

    sendResponse(res, 200, 'Users deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleAdminPanel,
  getUsers,
  updateUser,
  updateUsers,
  deleteUser,
  deleteUsers,
};
