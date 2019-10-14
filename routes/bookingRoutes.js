const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

module.exports = router;

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.allow('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.create1Booking);

router
  .route('/:id')
  .get(bookingController.get1Booking)
  .patch(bookingController.update1Booking)
  .delete(bookingController.delete1Booking);

// (req, res) => {
//   res.send(req.params.bookingId);
// }
