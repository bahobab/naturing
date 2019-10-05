const router = require('express').Router();

const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

router.get('/', viewsController.getOverview);

router.get('/tour/:slug', authController.protect, viewsController.geTour);

router.get('/login', viewsController.getLoginForm);

module.exports = router;
