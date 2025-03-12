const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: [
        "maintenance",
        "provisioning",
        "repairs",
        "catering",
        "cleaning",
        "security",
        "transportation",
      ],
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model('Service', serviceSchema);
