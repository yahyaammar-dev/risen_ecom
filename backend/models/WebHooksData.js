const mongoose = require('mongoose');

const webHooksData = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed,
});

const WebHooksData = mongoose.model('WebHooksData', webHooksData);

module.exports = WebHooksData;