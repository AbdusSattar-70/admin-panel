/* eslint-disable consistent-return */
const { USER_STATUS } = require('../config/token&CommonVar');
const User = require('../models/User.model');
const {
  sendResponse, handleUserStatusblock, handleUserStatusUnblock,
} = require('../utils/commonMethod');

const handleAdminPanel = async (req, res, next) => {
  try {
    // check user id from jwt
    const userId = req?.user;
    const validUser = await User.findOne({ _id: userId });

    if (!validUser) {
      return sendResponse(res, 404, 'User not found');
    }

    if (validUser.status === USER_STATUS.Blocked) {
      return sendResponse(res, 404, 'Blocked by Admin');
    }

    return sendResponse(res, 200, 'Admin Panel accessed successfully');
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const foundUsers = await User.find().select('-password -refreshToken -roles');

    if (!foundUsers.length) {
      return sendResponse(res, 204, 'No users found');
    }

    return sendResponse(res, 200, 'All users fetched successfully', foundUsers);
  } catch (err) {
    next(err);
  }
};

const updateUsersBlock = async (req, res, next) => {
  try {
    if (!req?.body?.userIds) {
      return sendResponse(res, 400, 'User IDs required');
    }

    const { userIds } = req.body;

    try {
      // parallelize the asynchronous operations
      await Promise.all(userIds.map((userId) => handleUserStatusblock(userId)));
      return sendResponse(res, 200, 'status blocked successfully');
    } catch (dbError) {
      sendResponse(res, 400, String(dbError));
    }
  } catch (err) {
    next(err);
  }
};
const updateUsersUnblock = async (req, res, next) => {
  try {
    if (!req?.body?.userIds) {
      return sendResponse(res, 400, 'User IDs required');
    }

    const { userIds } = req.body;

    try {
      // parallelize the asynchronous operations
      await Promise.all(userIds.map((userId) => handleUserStatusUnblock(userId)));
      return sendResponse(res, 200, 'Users status active success');
    } catch (dbError) {
      sendResponse(res, 400, String(dbError));
    }
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (!req?.params?.userId) {
      return sendResponse(res, 400, 'User ID is required');
    }

    const { userId } = req.params;

    try {
      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return sendResponse(res, 404, `User ID ${userId} not found`);
      }

      return sendResponse(res, 200, 'User deleted successfully');
    } catch (dbError) {
      sendResponse(res, 400, String(dbError));
    }
  } catch (err) {
    next(err);
  }
};

const deleteUsers = async (req, res, next) => {
  try {
    if (!req?.body?.userIds) {
      return sendResponse(res, 400, 'User IDs required');
    }

    const { userIds } = req.body;
    await User.deleteMany({ _id: { $in: userIds } });

    return sendResponse(res, 200, 'Users deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleAdminPanel,
  getUsers,
  updateUsersBlock,
  updateUsersUnblock,
  deleteUser,
  deleteUsers,
};
