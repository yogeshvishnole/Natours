const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('can not found document with this id', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('can not found document with this id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('can not found document with this id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };
    // 2. READING DATA FROM DATABASE WITH THE HELP OF MONGOOSE

    // API FEATURE 1 FILTERING

    // EXCLUDING PAGE,LIMIT,SORT,FIELDS  FROM QUERY STRINGS

    //  BUILD A QUERY

    // 1. FILTERING

    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach(el => delete queryObj[el]);

    //METHOD 1

    // find method return a query object which run as soon as find ends and give results
    // therfore we do it another way

    // const tours = await Tour.find(query.obj);

    // 2. ADVANCED FILTERING  'name=yogesh tour&price=291'

    //{difficulty:{gte:100}} url gives us this
    //{difficulty:{$gte:100}} we need this query string

    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // let query = Tour.find(JSON.parse(queryStr));

    // 3.SORTING 'sort=price'

    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }
    // sort('price ratingAvg') <- this is how sort function accept arguments and sort according to it so we have to convert query string in this format

    // 4. LIMITING THE FIELDS 'fields=name,duration,difficulty'

    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }

    // PAGINATION 'page=2&limit=10'

    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }

    //EXECUTE THE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    //METHOD 2

    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where.apply('difficulty')
    //   .equals('easy');

    //SEND RESPONSE

    res.status(200).json({
      status: 'success',
      result: doc.length,
      // requestTime: req.requestTime
      data: {
        data: doc
      }
    });
  });
