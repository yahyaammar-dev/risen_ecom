const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true }, 
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'products' }], 
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
},{
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
