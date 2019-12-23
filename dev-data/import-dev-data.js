// NODE CORE MODULES
const fs = require('fs');

// External libraries
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// From file system
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Review = require('./../models/reviewModel');

// Below command read our config.env file and our variables to node js environment variables
dotenv.config({ path: './config.env' });

// Connection to remote database
const DB = `mongodb+srv://yogesh:${process.env.DATABASE_PASSWORD}@cluster0-hciuk.mongodb.net/natours?retryWrites=true&w=majority`;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful'));

// READ DATA FROM THE FILE SYSTEM

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO THE DATABASE

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data loaded successfuly');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    console.log('Data deleted successfuly');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
