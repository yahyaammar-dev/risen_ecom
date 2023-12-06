const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  text: String,
  type: String,
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
});

const Notification = mongoose.model('notifications', notificationSchema);

module.exports = Notification;
