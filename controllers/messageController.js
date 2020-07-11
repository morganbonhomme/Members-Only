const { body, validationResult } = require('express-validator');
const moment = require('moment');
const async = require('async');

const Message = require('../models/message');

// Display All Messages
exports.displayMessagesGet = (req, res, next) => {
  Message
    .find()
    .populate('user')
    .exec((err, results) => {
      if (err) { return next(err); }
      res.render('displayMessages', { messages: results.reverse(), user: req.user });
    });
};

// Display Create Message Get
exports.createMessageGet = (req, res) => {
  res.render('createMessage', { user: req.user });
};

// Display Create Message Post
exports.createMessagePost = [
  body('title').trim(),
  body('text', 'You must write a message').trim().isLength({ min: 1 }),

  body('*').escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const date = moment();
    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      timestamp: date,
      user: req.user,
    });
    if (!errors.isEmpty()) {
      res.render('createMessage', { user: req.user, message, errors: errors.array() });
    } else {
      message.save((err) => {
        if (err) { return next(err); }
        res.redirect('/');
      });
    }
  },
];

// Delete message Post
exports.deleteMessagePost = (req, res, next) => {
  Message.findByIdAndDelete(req.params.messageID, (err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
};
