const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get the current booked tour
  // console.log('>>Tourid', req.params.tourId);
  const tour = await Tour.findById(req.params.tourId);

  // 2) create checkoutsession
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email, // because route is protected, user is added to req
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        // images: [null],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  // 3) create session and send it
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // temporary solution: using qurystring is UNSECURE!!!!
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();

  const booking = await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = factory.getAll(Booking);
exports.create1Booking = factory.createOne(Booking);
exports.get1Booking = factory.getOne(Booking);
exports.update1Booking = factory.updateOne(Booking);
exports.delete1Booking = factory.deleteOne(Booking);
