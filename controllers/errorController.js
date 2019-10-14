const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value} . Please use an other value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(error => error.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTExpiredError = () =>
  new AppError('Your login session has expired. Please login again', 401);

const handleJWTError = () =>
  new AppError('Invalid token. Please login and try again', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // A) API
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack
    });
  }

  // B) rendered page
  console.error('ERROR:', err);
  return res.status(err.statusCode).render('error', {
    title: 'DEV Non API: Something went wrong!!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // A) API

    // Operational trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // 1) log error
    console.error('ERROR:', err);

    // 2) Send generic message (unknown error)
    return res.status(500).json({
      status: 'error',
      message: 'Prod API Non Op: Something went terribly wrong!'
    });
  }

  // B) RENDER ERROR PAGE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Prod Non API Op: Something went wrong',
      msg: err.message
    });
  }

  // 1) log error
  console.error('ERROR:', err);

  // 2) Send generic message (unknown error)
  return res.status(err.statusCode).render('error', {
    title: 'Prod Non API Non Op: Something went wrong',
    msg: 'Please, try again later'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }

  next();
};
