const mongoose = require('mongoose');

const wolletteData = new mongoose.Schema({
  deviceId: String,
  locationId: String,
  staffId: String,
  type: String,
  json: String
});

const WolletteData = mongoose.model('wolletteData', wolletteData);

module.exports = WolletteData;