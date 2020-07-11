const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const Message = new Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now(), required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
);

Message
  .virtual('formattedDate')
  .get(function () {
    return moment(this.timestamp).format('DD/MM/YYYY, h:mm a');
  });

module.exports = mongoose.model('Message', Message);
