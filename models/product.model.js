const mongoose = require('mongoose');


const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    serviceArea: { type: String, required: true },
    sku: { type: String, unique: true, required: true },  // Unique Stock Keeping Unit
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;