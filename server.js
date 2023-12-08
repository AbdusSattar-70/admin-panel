const express = require('express');
const { default: mongoose } = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const credentials = require('./middleware/credentials');
const authRouter = require('./routes/authRouters');
const adminRouter = require('./routes/adminRouter');
const verifyJWT = require('./middleware/verifyJWT');
const verifyRoles = require('./middleware/verifyRoles');
const ROLES_LIST = require('./config/roles_list');

const app = express();

const PORT = process.env.PORT || 3500;

// custom middleware logger
app.use(logger);

// database connection using mongoose
const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('database connected successfully');
  } catch (error) {
    throw new Error(error);
  }
};

dbConnection();

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
app.use(verifyJWT, verifyRoles(ROLES_LIST.Admin));
app.use('/api/admin', adminRouter);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
