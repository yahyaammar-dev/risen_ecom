const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
});

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
