const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true }, 
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], 
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }
},{
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
