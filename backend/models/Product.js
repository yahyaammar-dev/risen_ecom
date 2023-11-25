const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  images: [String],
  description: String,
  barcodeId: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  promoCode: String
});
 
const Product = mongoose.model('Product', productSchema);

module.exports = Product;