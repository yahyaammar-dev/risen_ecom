const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  name: String,
  percentage: Number,
  type: String,
  validTill: Date,
  promoCode: String
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

module.exports = PromoCode;
