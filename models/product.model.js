const mongoose = require('mongoose');



const productSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    serviceArea: {
      type: String,
      required: true,
    },
    productQuantity: {
        type: Number,
        required: true,
      },
    productPrice: {
      type: Number,
      required: true,
    },

  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;