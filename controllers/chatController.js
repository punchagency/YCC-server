const Chat = require('../models/chat.model');

// @desc    Get a specific chat by ID
// @route   GET /api/chats/:id
// @access  Private
const getChatById = async (req, res) => {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    res.status(200).json(chat);
};

module.exports = {
    getChatById,
}; 