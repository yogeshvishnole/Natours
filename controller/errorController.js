const AppError = require('../utils/appError');

//IVALID ID ERROR HANDLER FUNCTION

const handleCastErrorDB = error => {
  // console.log(error);
  const message = `Invalid ${error.path} : ${error.value}`;
  // console.log(message);
  const err = new AppError(message, 400);
  // console.log(err.isOperational);
  return err;
};

const handleJWTExpiredError = () =>
  new AppError('Your token has expired ! please log in again ', 401);

const handleJWTError = () =>
  new AppError('Invalid token , please log in again', 401);

// DUPLICATE FIELD ERROR HANDLER

const handleDuplicateFieldErrorDB = error => {
  const value = error.errmsg.match(/"((?:\\.|[^"\\])*)"/);
  const message = `Duplicate field name : ${
    value[0]
  } . Please use another value`;
  return new AppError(message, 400);
};

// HANDLING MONGOOSE VALIDATION ERROR

const handleValidationErrorDB = error => {
  const values = Object.values(error.errors).map(el => el.message);
  const message = `Invalid field values. ${values.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  console.log(err);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      Error: err,
      Stack: err.stack
    });
  }
  //Rendered Website
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // OPERATIONAL TRUSTED ERROR : SEND MESSAGE TO CLIENT
  // console.log(err.isOperationl);

  if (req.originalUrl.startsWith('/api')) {
    // A) API
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // PROGRAMMING OR OTHER ERROR DON'T LEAK ERROR DETAILS

    // 1. LOG ERROR

    console.error('ERROR ', err);

    // 2. SEND GENERIC MESSAGE TO CLIENT

    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    });
  }
  // B) // Rendered Website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message
    });
  }
  // PROGRAMMING OR OTHER ERROR DON'T LEAK ERROR DETAILS

  // 1. LOG ERROR

  console.error('ERROR ', err);

  // 2. SEND GENERIC MESSAGE TO CLIENT

  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: 'Please try again later'
  });
};

module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
      // console.log(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldErrorDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB();
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, req, res);
  }
};
