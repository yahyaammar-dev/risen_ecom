const mongoose = require('mongoose');

const staffAdminSchema = new mongoose.Schema({
  login: String,
  password: String,
  email: String,
});

const StaffAdmin = mongoose.model('StaffAdmin', staffAdminSchema);

module.exports = StaffAdmin;
