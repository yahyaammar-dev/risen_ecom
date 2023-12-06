const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  images: [String],
  description: String,
  barcodeId: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  promoCode: String,
  price: String
});
 
const Product = mongoose.model('products', productSchema);

module.exports = Product;
