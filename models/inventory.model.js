const mongoose = require('mongoose');



const InventorySchema = new mongoose.Schema(
  {
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true },
    warehouseLocation: { type: String, required: false },
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;