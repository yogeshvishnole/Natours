const Tour = require('./../models/tourModel');
// const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('../utils/appError');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res) => {
  // 1. Get tour data from collection

  const tours = await Tour.find();

  // 2. Build the template

  // 3. Render that template using tour data from 1.

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  // 1. Get the data for the requested tour , including guides and reviews

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  // 2. Build the template

  // 3. Render the template using data from step 1
  if (tour) {
    res.status(200).render('tour', {
      title: tour.name,
      tour
    });
  } else {
    next(new appError('There is no tour find with this name', 404));
  }
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Log into your account' });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1.) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2.) Find tours with returned ids
  const tourIds = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});
