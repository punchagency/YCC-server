const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  // isRejected: { type: Boolean, default: false },
  rejectionReason: { type: String, default: null, required: false },

  // References to role-specific details
  crewProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crew',
  },

  vendorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },

  supplierProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
}, { timestamps: true });

// Validate that user doesn't have multiple profiles
userSchema.pre('save', function (next) {
  const profiles = [
    this.crewProfile,
    this.vendorProfile,
    this.supplierProfile,
  ].filter(Boolean);

  if (profiles.length > 1) {
    next(new Error('A user cannot have multiple role-specific profiles'));
  }
  next();
});

// Ensure profile matches role
userSchema.pre('save', async function (next) {
  if (this.isModified('role')) {
    const Role = mongoose.model('Role');
    const role = await Role.findById(this.role);

    if (!role) {
      return next(new Error('Invalid role'));
    }

    // Check if profile matches role
    if (role.name === 'crew_member' && !this.crewProfile) {
      return next(new Error('Crew member must have a crew profile'));
    }
    if (role.name === 'service_provider' && !this.vendorProfile) {
      return next(new Error('Service provider must have a vendor profile'));
    }
    if (role.name === 'supplier' && !this.supplierProfile) {
      return next(new Error('Supplier must have a supplier profile'));
    }
  }
  next();
});

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
