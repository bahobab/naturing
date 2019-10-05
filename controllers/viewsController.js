const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) get tour data
  const tours = await Tour.find();

  // 2) Build template
  // 3) render template with tour data
  res.status(200).render('overview', {
    title: 'All tours',
    tours
  });
});

exports.geTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) return next(new AppError('No tour found with provided id', 404));

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginForm = (req, res) => {
  // render login page
  res.status(200).render('login', { title: 'Log into your account' });
};
