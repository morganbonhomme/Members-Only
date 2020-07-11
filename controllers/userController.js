const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

// Display sign-up form GET
exports.userSignupGet = function (req, res) {
  res.render('userSignupForm');
};

// Display sign-up form POST
exports.userSignupPost = [

  // Validate fields
  body('firstName', 'First name must not be empty').trim().isLength({ min: 1 }),
  body('lastName', 'Last name must not be empty').trim().isLength({ min: 1 }),
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username must not be empty')
    .custom(value => {
      return User.findOne({ username : value }).then(user => {
        if (user) { return Promise.reject('Username already taken')
        }
      })
    }),
  body('password', 'Password must contains at least 6 characters').trim().isLength({ min: 1 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),

  // Sanitize fields
  body('*').escape(),

  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Hash password
    bcrypt.hash('password', 10, (err, hashedPassword) => {
      if (err) { return next(err); }

      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
        membership: false,
      });
      if (!errors.isEmpty()) {
        res.render('userSignupForm', { user, errors: errors.array() });
      } else {
        user.save((err) => {
          if (err) { return next(err); }
          res.redirect('/log-in');
        });
      }
    });
  },
];

// Display log-in form GET
exports.userLoginGet = function (req, res, next) {
  res.render('userLoginForm', { user: req.user });
};

// Display join-in GET
exports.userJoininGet = function (req, res) {
  res.render('userJoininForm', { user: req.user });
};

// Display join-in POST
exports.userJoininPost = function (req, res, next) {
  const correctAnswer = process.env.ANSWER;
  if (correctAnswer !== req.body.answer) {
    res.render('userJoininForm', { user: req.user, error: 'Try again' });
  } else {
    const updateUser = req.user;
    updateUser.membership = true;
    User.findByIdAndUpdate(req.user.id, updateUser, {}, (err) => {
      if (err) { return next(err); }
    });
    res.redirect('/');
  }

// Add the fact that the user is connected, otherwise it can't go there
};

exports.userBecomeAdminGet = function (req, res, next) {
  res.render('userAdminForm', { user: req.user });
};

exports.userBecomeAdminPost = function (req, res, next) {
  const correctAnswer = process.env.ANSWERADMIN;
  if (correctAnswer !== req.body.answer) {
    res.render('userAdminForm', { user: req.user, error: 'Try again' });
  } else {
    const updateUser = req.user;
    updateUser.admin = true;
    User.findByIdAndUpdate(req.user.id, updateUser, {}, (err) => {
      if (err) { return next(err); }
      res.redirect('/');
    });
  }
};
