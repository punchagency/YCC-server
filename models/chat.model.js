const mongoose = require('mongoose')
const User = require('./user.model')

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    messages: [{
        role: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }],
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Chat', chatSchema)

