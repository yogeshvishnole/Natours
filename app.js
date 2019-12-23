// importing core modules and dependencies

//const fs = require('fs');
const path = require('path');
const express = require('express');

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorController = require('./controller/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

////////////////////////////////////////////////////////////////////////

// Express global middlewares

// Set Http security headers

app.use(helmet());

// 1. cors middeware for resolving browsers cross origin policy

// 2. express.json() middleware for adding body property to req object

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// 3. express.static for serving static files without routes

//?? THIRD PARTY MIDDLEWARES

// Limits request from a single IP

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour'
});

app.use('/api', limiter);

// Development logging

if (process.env.NODE_ENV === 'development')
  app.use(
    morgan('dev')
  ); /**morgan return a function like (req,res,next)=>{--something--} */

//?? MY VERY OWN MIDDLEWARES

/**Middleware always called in a sequence as they defined in the code
 * Routes are also middleware functions
 * if use this mid. function after a route it will not work because that route terminates mid. pipeline by sending response
 */

// app.use((req, res, next) => {
//   console.log('Hello, from middleware');
//   next();
// });

// this gives you request time
// for general use
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

///////////////////////////////////////////////////////////////////////////////

// ROUTING

/**Separated route handlers */

//--imported--/

//?? 'users' RESOURCE ROUTE HANDLERS

//--imported--/

/**Routes */

//   // Get request for getting all tours

//   app.get('/api/v1/tours', getAllTours);

// // Get request for single tour with url param  /:id

// app.get('/api/v1/tours/:id', getTour);

// //Patch Request for updating a tour

// app.patch('/api/v1/tours/:id', updateTour);

// // Delete http method for deleting a tour

// app.delete('/api/v1/tours/:id',deleteTour);

// // Post Request for creating a new tour

// app.post('/api/v1/tours', createTour);

/**?? Better way of writing ROUTES */

//?? CREATING AND MOUNTING ROUTES

/** Mounting of routes */
//# specification of routes for particular middlewares
//# this are like sub applications with their base routes
// # we created different router for each of resources for nice separation of concern between this resources

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

// ERROR HANDLING STUFF

app.all('*', (req, res, next) => {
  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.statusCode = 404;
  // err.status = 'Fail';

  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorController);

// CENTRAL ERROR MIDDLEWARE

//?? 'tours' resource routes

//--imported--/

//?? 'users' resource routes

//--imported--/

//////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////

// SIDE NOTES /-

/**
 * Status code meaning
 * 200 = ok
 * 201 = create a new anything
 * 204 = no content
 * 404 = not found
 * 500 = internal server error
 * 400 = bad request sent by client
 * 403 = Not authorized
 */

module.exports = app;
