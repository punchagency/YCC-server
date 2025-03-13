const mongoose = require('mongoose');

const crewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    country: String,
    position: {
      type: String,
      enum: ['captain', 'exterior', 'interior', 'chef', 'engineering'],
      required: true,
    },
    yearsOfExperience: {
      type: String,
      enum: ['1', '2', '3', '4', '5'],
      required: true,
    },
    nationality: String,
    passportCountry: String,
    preferredCommunication: {
      type: String,
      enum: ['email', 'whatsapp', 'chat'],
    },
    currentLocation: String,
    availability: String,
    currentVessel: String,
    certifications: [{ type: String }],
    certificationFiles: [String],
    cv: String,
    profilePicture: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crew', crewSchema);
