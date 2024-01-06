const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  images: [String],
  description: String,
  barcodeId: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
  promoCode: String,
  price: String
});
 
const Product = mongoose.model('products', productSchema);

module.exports = Product;
