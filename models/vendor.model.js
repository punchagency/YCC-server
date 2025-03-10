const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
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
    businessAddress: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      enum: [
        'captain',
        'crew',
        'exterior',
        'engineering',
        'interior',
        'galley',
      ],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    businessWebsite: String,
    taxId: String,
    licenseFile: String,
    liabilityInsurance: String,
    services: [
      {
        type: String,
        required: true,
      },
    ],
    pricingStructure: String,
    availability: String,
    bookingMethod: {
      type: String,
      enum: ['instant meeting', 'request to book', 'quote request'],
      required: true,
    },
    serviceArea: {
      type: String,
      enum: ['caribbean', 'mediterranean', 'usa'],
      required: true,
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

module.exports = mongoose.model('Vendor', vendorSchema);