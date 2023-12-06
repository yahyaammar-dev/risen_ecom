const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: String,
  address: String,
  latitude: String,
  longitude: String
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;