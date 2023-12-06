const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
});

const Admin = mongoose.model('admins', adminSchema);

module.exports = Admin;
