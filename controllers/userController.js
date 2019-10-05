// const fs = require('fs');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const noewObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      noewObj[key] = obj[key];
    }
  });

  return noewObj;
};

const createUser = async (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not valid. Use /signup instead!'
  });
};

const getAllUsers = factory.getAll(User);
const get1User = factory.getOne(User);
const update1User = factory.updateOne(User);
const delete1User = factory.deleteOne(User);

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const updateMe = catchAsync(async (req, res, next) => {
  // handle case user POSTed password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for updates. Please use /updateMyPassword',
        400
      )
    );
  }

  // filter out unwanted fields
  const filteredody = filterObj(req.body, 'name', 'email');
  // update user document

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  getMe,
  deleteMe,
  updateMe,
  getAllUsers,
  get1User,
  createUser,
  update1User,
  delete1User
};
