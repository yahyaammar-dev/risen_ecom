const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  name: String,
  percentage: Number,
  type: String,
  validTill: Date,
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

module.exports = PromoCode;
