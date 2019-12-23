// External libraries
const mongoose = require('mongoose');
const slugify = require('slug');
// const validator = require('validator');
// const User = require('./userModel');

//*****Creating our first schema  */
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must have name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less than 40 characters'],
      minlength: [10, 'A tour name must have more than 10 characters']
      // validate: [validator.isAlpha, 'only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'a tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be easy ,medium ,difficult'
      }
    },
    price: {
      type: Number,
      required: [true, 'a tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        // this only points to current document on NEW document creation not updating the document
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount should be less than regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a descrption']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating must be below 5'],
      min: [1, 'Rating must be above 1'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 4.8,
      max: [5, 'Rating must be below 5'],
      min: [1, 'Rating must be above 1']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image ']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJSON

      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// ADDING VIRTUAL PROPERTIES IN OUR SCHEMA

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE : RUN BEFORE ONLY .SAVE() AND .CREATE() COMMAND AND NOT ANY OTHER COMMAND

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidePromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);

//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('will save document');
//   next();
// });

// //post document save hook

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

/**OUERY MIDDLEWARE */

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  // this.end = Date.now();
  console.log(` query execution time is : ${Date.now() - this.start}`);
  // console.log(docs);
  next();
});

// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
