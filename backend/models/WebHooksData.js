const mongoose = require('mongoose');

const webHooksData = new mongoose.Schema({
  deviceId: String,
  locationId: String,
  staffId: String,
  type: String,
  json: String
});

const WebHooksData = mongoose.model('WebHooksData', webHooksData);

module.exports = WebHooksData;