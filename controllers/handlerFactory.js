const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc)
      return next(new AppError('No Doc found with the id 9provided', 404));

    res.status(204).json({
      status: 'success',
      data: {
        data: null
      }
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });

    if (!doc) {
      return next(new AppError('No document found with the ID provided', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    console.log('populate >>>', populateOptions);
    let doc;
    if (populateOptions)
      doc = await Model.findById(req.params.id).populate(populateOptions);
    else doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with the ID provided', 404));
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
    let filter = {}; // to allow for nested GET reviews on tour
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // console.log('All tours', features);
    const docs = await features.query;
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { data: docs }
    });
  });
