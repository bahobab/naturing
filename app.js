const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const momgoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoute');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// app.use(
//   cors({
// origin: 'http://localhost:3003',
// credentials: true,
// allowedHeaders: ['Content-Type', 'Authorization'],
// methods: ['GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'],
// preflightContinue: false
//   })
// );

// Global middlewares
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, `public/`)));
app.use(helmet.noSniff());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP address. Please try again later'
});
app.use('/api', limiter);

// app.use(bodyParser.json({ limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(momgoSanitize());
app.use(xssClean());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// error handling route
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Failed',
  //   message: `Can't find page requested: ${req.url}`
  // });

  // const err = new Error(`Can't find page requested: ${req.url}`);
  // err.status = 'failed';
  // err.statusCode = 404;
  next(new AppError(`Can't find page requested: ${req.url}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
