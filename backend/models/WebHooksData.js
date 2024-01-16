const mongoose = require('mongoose');

const webHooksData = new mongoose.Schema({
  data: String,
});

const WebHooksData = mongoose.model('WebHooksData', webHooksData);

module.exports = WebHooksData;