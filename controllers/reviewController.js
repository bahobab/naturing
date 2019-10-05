const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

const setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId; //tourId defined in tourRoute.js
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

const getAllReviews = factory.getAll(Review);
const get1Review = factory.getOne(Review);
const delete1Review = factory.deleteOne(Review);
const update1Review = factory.updateOne(Review);
const create1Review = factory.createOne(Review);

module.exports = {
  setTourUserId,
  get1Review,
  delete1Review,
  getAllReviews,
  update1Review,
  create1Review
};
