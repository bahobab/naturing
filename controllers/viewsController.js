const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
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

  if (!tour) return next(new AppError('No tour found with provided name', 404));

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginForm = (req, res) => {
  // render login page
  res.status(200).render('login', { title: 'Log into your account' });
};

exports.getAccount = (req, res) => {
  // user is already on the locals values available in views
  res.status(200).render('account', {
    title: 'Your Account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIds = bookings.map(booking => booking.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', { title: 'My Tours', tours });
});
