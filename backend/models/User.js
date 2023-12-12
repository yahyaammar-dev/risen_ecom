const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  promoCode: String,
  otp: String,
  img: String,
  role: String,
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
});

const User = mongoose.model('User', userSchema);

module.exports = User;