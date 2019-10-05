const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

// const User = require('./userModel'); // needed for embeded guides

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name cannot exceed 40 characters'],
      minlength: [10, 'A tour name cannot be less than 10 characters']
      // validate: [validator.isAlpha, 'Tour name cann only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a MaxGroupSize property']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty level'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: `Possible difficulty values are: ['easy', 'medium', 'difficult']`
      }
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating cannot be less than 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be greater than 1'],
      max: [5, 'Rating must be less than 6'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validator: function(val) {
        // this function will not apply to updates. Only to new create
        return val < this.price;
      },
      message: 'Discount price {{VALUE}} must be less that tour price'
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover']
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
      // GeoJson
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
        day: Number
      }
    ],
    // guides: [String]
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// virtual popuolate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// embeding

// tourSchema.pre('save', async function(next) {
//   this.guides = await Promise.all(
//     this.guides.map(async id => await User.findById(id))
//   );

//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('>>Will save Doc');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log('Post doc', doc);
//   next();
// });

tourSchema.pre(/^find/, function(next) {
  // tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log('POST FIND', docs);

  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-_v -passwordChangedAt'
  });

  next();
});

// AGGREGATION MIDDLEWARE

// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // add in front of array
//   console.log('AGGREGARE PRE', this);

//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
