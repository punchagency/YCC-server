const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    website: {
      type: String,
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
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    inventorySource: {
      type: String,
      enum: ['API', 'Spreadsheet', 'Manual'],
    },
    deliveryOptions: [
      {
        type: String,
      },
    ],
    serviceAreas: [
      {
        type: String,
      },
    ],
    licenseSupplierFile: {
      type: String,
    },
    supplierVatTaxId: {
      type: String,
    },
    supplierLiabilityInsurance: {
      type: String,
    },
    spreadsheetFile: {
      type: String,
    },
    contactPerson: {
      fullName: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);