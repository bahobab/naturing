const router = require('express').Router({ mergeParams: true });

const authController = require('../controllers/authController');
const {
  setTourUserId,
  get1Review,
  getAllReviews,
  delete1Review,
  update1Review,
  create1Review
} = require('../controllers/reviewController');

router.use(authController.protect);

router
  .route('/:id')
  .get(get1Review)
  .patch(authController.allow('admin', 'user'), update1Review)
  .delete(
    authController.allow('admin', 'user'),
    authController.allow('admin'),
    delete1Review
  );

router
  .route('/')
  .get(getAllReviews)
  .post(authController.allow('user'), setTourUserId, create1Review);

module.exports = router;
