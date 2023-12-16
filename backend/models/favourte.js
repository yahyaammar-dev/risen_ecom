const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
  favourite: Boolean,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Favourite = mongoose.model('favourites', favouriteSchema);

module.exports = Favourite;
