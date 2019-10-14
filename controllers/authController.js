const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Email = require('../utils/sendmail');

const signToken = id => {
  return jwt.sign(
    {
      id
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({ name, email, password, passwordConfirm });

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log('>>url', url);
  await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser, 201, res);
});

exports.signin = catchAsync(async (req, res, next) => {
  console.log('ZZZZ:', req.body);
  const { email, password } = req.body;
  // check if user provided email and password
  if (!(password && email))
    return next(new AppError('Please provide email and password', 400));
  // verify user exists
  // console.log(await User.find());
  const user = await User.findOne({ email }).select('+password');
  console.log('ZZZZ user exist??:', user);
  const corrPswd = await user.correctPassword(password, user.password);

  if (!(user && corrPswd)) {
    return next(new AppError('Incorrect user or password', 401));
  }
  // send token
  createAndSendToken(user, 200, res);
});

exports.isLoggedIn = async (req, res, next) => {
  // check token exists

  if (req.cookies.jwt) {
    try {
      // verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // check user exists
      const decodedUser = await User.findById(decoded.id);

      if (!decodedUser) return next();

      // check if user changed password since token was issued
      if (decodedUser.changedPasswordAfter(decoded.iat)) return next();

      // user is logged in grant access
      res.locals.user = decodedUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // check token exists
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token) {
    return next(
      new AppError('Your are not logged in. Please login to gain access'),
      401
    );
  }

  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check user exists
  const decodedUser = await User.findById(decoded.id);
  if (!decodedUser)
    return next(new AppError('This user no longer exists on the system', 401));
  // check if user changed password since token was issued
  if (decodedUser.changedPasswordAfter(decoded.iat))
    return new AppError('User changed password. Please login again', 401);

  // grant access
  req.user = decodedUser;
  res.locals.user = decodedUser;
  next();
});

exports.allow = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not authorized to perform this operation', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user from the provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with such email address.'), 404);
  // generate a random token
  const resetToken = user.createPasswordResetToken();
  // save the user becase in userModel we modified resetToken and resetTokenEpires params
  await user.save({ validateBeforeSave: false }); // because we are not login in

  try {
    // const resetURL = 'xxx';
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on the token (the token sent to the user is not encrypted!!)
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  // if the token is not expired, and user exists set a new password
  if (!user)
    return next(
      new AppError(
        'Password reset token has expired, or user does not exist',
        400
      )
    );
  // update user properties
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // log the user in and send the new JWT
  createAndSendToken(user, 200, res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
  // find user
  // do not use findOneAndUpdate
  const user = await User.findById(req.user.id).select('+password');

  // check if the user's current password passwordCurrent is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // log user in, then send JWT
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createAndSendToken(user, 200, res);
});

// exports.updatedUserData = catchAsync(async (req, res, next) => {
//   const updatedUser = await User.findByIdAndUpdate(req.user.id, {
//     name: req.body.name,
//     email: req.body.email
//   });
//   res.status(201).render('account', updatedUser);
// });
