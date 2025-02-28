const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
        unique: true
    },

    token: {
        type: String,
        required: true
    },

    expiry: { type: Date }

})


const Otp = mongoose.model("Otp", otpSchema)
module.exports = Otp;