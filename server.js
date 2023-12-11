const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const connectDb = require('./config/connectDb');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const credentials = require('./middleware/credentials');
const authRouter = require('./routes/authRouters');
const adminRouter = require('./routes/adminRouter');
const verifyJWT = require('./middleware/verifyJWT');

const app = express();

const PORT = process.env.PORT || 3500;

// custom middleware logger
app.use(logger);

// database connection using mongoose
connectDb();

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: true }));

// built-in middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// routes for user signup,signin,signout,refreshToken
app.use('/api/auth', authRouter);

// routes for secure admin panel to fetch users, access admin panel,update or delete users
app.use(verifyJWT);
app.use('/api/admin', adminRouter);

// default errror handler
app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
