const mongoose = require('mongoose');

const schedule = new mongoose.Schema({
  schedule1: String,
  schedule2: String,
  schedule3: String,
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
});

const Schedule = mongoose.model('schedule', schedule);

module.exports = Schedule;
