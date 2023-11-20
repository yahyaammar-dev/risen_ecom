const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Define order properties as needed
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
