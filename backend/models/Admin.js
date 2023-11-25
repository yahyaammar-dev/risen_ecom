const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
