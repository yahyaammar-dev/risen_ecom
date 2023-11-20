const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  images: [String],
  description: String,
  barcodeId: String,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
s