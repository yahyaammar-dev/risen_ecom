const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: String,
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
});

const Area = mongoose.model('Area', areaSchema);

module.exports = Area;