const mongoose = require('mongoose');
require('dotenv').config();

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('database connected successfully');
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = connectDb;