const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('File provided not an image! Please upload image only', 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// upload.array('images', 5) -> req.files // multiple images
// upload.single('image') -> req.file    // single image

const resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);

  if (!(req.files.imageCover && req.files.images)) return next();

  // 1) imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) tour images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (imageFile, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpg`;

      await sharp(imageFile.buffer)
        .resize(2000, 1333)
        .toFormat('jpg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.push(filename);
    })
  );

  next();
});

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// const checkTourId = (req, res, next, value) => {
//   console.log(`Tour id is:${value}`);

// if (req.params.id * 1 > tours.length) {
//   return res.status(404).json({ staus: 'failed', message: 'Invalid Id' });
// }

//   next();
// };

// const checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res
//       .status(400)
//       .json({ status: 'failed', message: 'Name and price are required' });
//   }

//   next();
// };

const topTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

const getAllTours = factory.getAll(Tour);
const get1Tour = factory.getOne(Tour, { reviews: 'reviews', path: 'reviews' });
const update1Tour = factory.updateOne(Tour);
const delete1Tour = factory.deleteOne(Tour);
const create1Tour = factory.createOne(Tour);

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { rating: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$rating' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // { $match: { _id: { $ne: 'EASY' } } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

const monthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: `$startDates` },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    { $limit: 12 }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

const toursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!(lat && lng)) {
    next(new AppError('Please provide latitude and longitude', 400));
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lat, lng], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!(lat && lng)) {
    next(new AppError('Please provide latitude and longitude', 400));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});

module.exports = {
  monthlyPlan,
  getTourStats,
  topTours,
  getAllTours,
  get1Tour,
  create1Tour,
  update1Tour,
  delete1Tour,
  toursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages
  // checkTourId,
  // checkBody
};
