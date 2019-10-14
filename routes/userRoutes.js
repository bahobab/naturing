const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

const {
  getMe,
  deleteMe,
  updateMe,
  getAllUsers,
  get1User,
  createUser,
  uploadUserPhoto,
  resizeUserPhoto,
  update1User,
  delete1User
} = require('../controllers/userController');

router.get('/me', authController.protect, getMe, get1User);
router.post('/signup', authController.signup);
router.post('/login', authController.signin);
router.get('/logout', authController.logout);
// router.patch(
//   '/update-data',
//   authController.protect,
//   authController.updatedUserData
// );

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// protect all routes after this middleware
router.use(authController.protect);

router.patch('/changeMyPassword', authController.changePassword);
router.delete('/deleteMe', deleteMe);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);

// routes bellow restricted to admin
router.use(authController.allow('admin'));

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

// router
//   .route('/:id')
//   .get(get1User)
//   .patch(update1User)
//   .delete(delete1User);

module.exports = router;
