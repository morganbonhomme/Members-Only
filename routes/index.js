const express = require('express');
const passport = require('passport');

const router = express.Router();

// Require controllers modules
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('log-in');
};

// User Routes
router.get('/sign-up', userController.userSignupGet);
router.post('/sign-up', userController.userSignupPost);
router.get('/log-in', userController.userLoginGet);
router.post('/log-in', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/log-in',
  failureFlash: true,
}));
router.get('/join-in', checkAuthenticated, userController.userJoininGet);
router.post('/join-in', checkAuthenticated, userController.userJoininPost);
router.get('/become-admin', checkAuthenticated, userController.userBecomeAdminGet);
router.post('/become-admin', checkAuthenticated, userController.userBecomeAdminPost);
router.get('/log-out', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Message Routes
router.get('/', messageController.displayMessagesGet);
router.get('/create-message', checkAuthenticated, messageController.createMessageGet);
router.post('/create-message', checkAuthenticated, messageController.createMessagePost);
router.post('/:messageID/delete-message', checkAuthenticated, messageController.deleteMessagePost);
module.exports = router;
