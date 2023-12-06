const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  promoCode: String,
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
});

const User = mongoose.model('User', userSchema);

module.exports = User;













// // models/User.js
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     // ... other user fields
//     promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode' },
// });

// const User = mongoose.model('User', userSchema);

// module.exports = User;

// // models/Product.js
// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//     // ... other product fields
//     promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode' },
// });

// const Product = mongoose.model('Product', productSchema);

// module.exports = Product;

// // models/Category.js
// const mongoose = require('mongoose');

// const categorySchema = new mongoose.Schema({
//     // ... other category fields
//     promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode' },
// });

// const Category = mongoose.model('Category', categorySchema);

// module.exports = Category;

// // models/Promotion.js
// const mongoose = require('mongoose');

// const promotionSchema = new mongoose.Schema({
//     percentage: { type: Number, required: true },
//     type: { type: String, enum: ['user', 'product', 'category'], required: true },
//     // Add other fields specific to each type if needed
// });

// const Promotion = mongoose.model('Promotion', promotionSchema);

// module.exports = Promotion;

// // models/PromoCode.js
// const mongoose = require('mongoose');

// const promoCodeSchema = new mongoose.Schema({
//     code: { type: String, unique: true, required: true },
//     promotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: true },
// });

// const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

// module.exports = PromoCode;