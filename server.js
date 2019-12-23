// External libraries
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Below command read our config.env file and our variables to node js environment variables
dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION');
  process.exit(1);
});

const app = require('./app');

// Connection to remote database
const DB = `mongodb+srv://yogesh:${process.env.DATABASE_PASSWORD}@cluster0-hciuk.mongodb.net/natours?retryWrites=true&w=majority`;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful'));
console.log(process.env.NODE_ENV);

/////****Method to connect to local database */

// mongoose
//   .connect(process.env.DATABASE_LOCAL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false
//   })
//   .then(() => console.log('DB connection successful'));

// ENVIRONMENT VARIABLES

/** environment variables are global variables to define the environment in which our node app is running */

//?? environment variable defined by express

//console.log(app.get('env'));

//?? environment variable defined by node

// rem = process module in node is equivalent to java.lang package in java according to me

//CREATING HTTP SERVER

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION');
  server.close(() => {
    process.exit(1);
  });
});

///////////////////////////////////////////////////////////////////////////////////////
