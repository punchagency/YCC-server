const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
      required: function () {
        return !['service_provider', 'supplier'].includes(this.role);
      },
      minlength: [8, 'Password must be at least 8 characters'],
    },

    role: {
      type: String,
      enum: ['admin', 'captain', 'service_provider', 'supplier', 'crew_member'],
      required: true,
    },

    isApproved: { type: Boolean, default: false },
    // isRejected: { type: Boolean, default: false },
    rejectionReason: { type: String, default: null, required: false },

    // Crew Member Fields
    crewDetails: {
      firstName: {
        type: String,
        required: function () {
          return this.role === 'crew_member';
        },
        trim: true,
      },
      lastName: {
        type: String,
        required: function () {
          return this.role === 'crew_member';
        },
        trim: true,
      },
      phone: {
        type: String,
        required: function () {
          return this.role === 'crew_member';
        },
      },
      country: String,
      position: {
        type: String,
        enum: ['captain', 'exterior', 'interior', 'chef', 'engineering'],
      },
      yearsOfExperience: {
        type: String,
        enum: ['1', '2', '3', '4', '5'],
        required: function () {
          return this.role === 'crew_member';
        },
      },
      nationality: { type: String },
      passportCountry: { type: String },
      preferredCommunication: {
        type: String,
        enum: ['email', 'whatsapp', 'chat'],
      },
      currentLocation: { type: String },
      availability: { type: String },
      currentVessel: { type: String },
      certifications: [{ type: String }], // List of certification names
      certificationFiles: [String], // File paths
      cv: String, // File path
      profilePicture: String, // File path (optional)
    },

    // Vendor Fields (Service Provider)
    vendorDetails: {
      businessName: { type: String },
      businessAddress: { type: String },
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
      },
      phone: { type: String },
      businessWebsite: { type: String },
      taxId: { type: String },
      licenseFile: { type: String },
      liabilityInsurance: { type: String },
      services: [{ type: String }],
      pricingStructure: { type: String },
      availability: { type: String },
      bookingMethod: {
        type: String,
        enum: ['instant meeting', 'request to book', 'quote request'],
      },
      serviceArea: {
        type: String,
        enum: ['caribbean', 'mediterranean', 'usa'],
      },
      // Locations served
      contactPerson: {
        fullName: { type: String },
        role: { type: String },
        
      },
    },

    // Supplier Fields
    supplierDetails: {
      businessName: { type: String },
      businessType: {
        type: String,
        enum: [
          'Food Provisions',
          'Marine Equipment',
          'Cleaning Supplies',
          'Fuel',
        ],
      },
      inventorySource: { type: String, enum: ['API', 'Spreadsheet', 'Manual'] },
      deliveryOptions: [
        { type: String, enum: ['Same-day', 'Scheduled', 'Express'] },
      ],
      serviceAreas: [{ type: String }],
      licenseFile: { type: String }, // File path
      vatTaxId: { type: String }, // File path
      liabilityInsurance: { type: String }, // File path
      contactPerson: {
        fullName: { type: String },
        role: { type: String },
       
      },
    },
  },

  { timestamps: true }
);

// Hash password before saving
// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// Compare entered password with hashed password
// userSchema.methods.comparePassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

module.exports = mongoose.model('User', userSchema);
