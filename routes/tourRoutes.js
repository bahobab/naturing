const express = require('express');

const router = express.Router();

const { protect, allow } = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');

const {
  monthlyPlan,
  topTours,
  getTourStats,
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
} = require('../controllers/tourController');

// route functions

router.use('/:tourId/reviews', reviewRouter);

// router.param('id', checkTourId);

router.route('/top-5-cheap').get(topTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router
  .route('/monthly-plan/:year')
  .get(protect, allow('admin', 'lead-guide'), monthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  // /tours-within?distance=223&center=40&unit=km
  .get(toursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, allow('admin', 'lead-guide'), create1Tour);

router
  .route('/:id')
  .get(get1Tour)
  .patch(
    protect,
    allow('admin'),
    uploadTourImages,
    resizeTourImages,
    update1Tour
  )
  .delete(protect, allow('admin'), delete1Tour);

module.exports = router;
