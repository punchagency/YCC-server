const mongoose = require('mongoose');



const inventorySchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    businessType: {
      type: String,
      enum: [
        'Food Provisions',
        'Marine Equipment',
        'Cleaning Supplies',
        'Fuel',
      ],
      required: true,
    },
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;