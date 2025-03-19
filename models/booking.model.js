const mongoose = require("mongoose");
const Vendor = require("./vendor.model");
const Service = require("./service.model");
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        quantity: {
          type: Number,
          required: false,
          min: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "declined"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    bookingId: {
      type: String,
      unique: true,
      default: () => `#${crypto.randomBytes(4).toString("base64url")}`,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Booking', bookingSchema);
