const fs = require('fs');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('>> DB connection successful'));

// read json data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// clear database
const clearDatabase = async () => {
  try {
    await Tour.deleteMany();
    console.log('Success Clearing Tour Database');
    await User.deleteMany();
    console.log('Success Clearing User Database');
    await Review.deleteMany();
    console.log('Success Clearing Review Database');

    mongoose.disconnect();
  } catch (error) {
    console.log('Error Clearing Database:', error);
    mongoose.disconnect();
  }
};

// import data into database
const importData = async () => {
  try {
    // await clearDatabase();
    await Tour.create(tours);
    console.log('Create Tour success');
    await User.create(users, { validateBeforesave: false });
    console.log('Create User success');
    await Review.create(reviews);
    console.log('Create Review success');
    // mongoose.disconnect();
  } catch (error) {
    console.log('Error Importing Database:', error);
    mongoose.disconnect();
  }
};

// seperate the 2 oprations

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--clear') {
  clearDatabase();
} else {
  clearDatabase();
  importData();
}

// importData();
