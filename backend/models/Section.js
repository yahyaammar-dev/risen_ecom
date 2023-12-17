const mongoose = require('mongoose');
const sectionSchema = new mongoose.Schema({
  name: String,
  promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode' }
});
const Section = mongoose.model('Section', sectionSchema);
module.exports = Section;