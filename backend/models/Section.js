const mongoose = require('mongoose');
const sectionSchema = new mongoose.Schema({
  name: String,
  percentage: Number,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'products' }]
});
const Section = mongoose.model('Section', sectionSchema);
module.exports = Section;