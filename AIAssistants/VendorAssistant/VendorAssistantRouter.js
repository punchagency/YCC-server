const vendorAssistantRouter = require('express').Router();
const ToolSelection = require('./tools/toolSelector');
const Chat = require('../../models/chat.model');

vendorAssistantRouter.post('/', async (req, res) => {

    let chat = req.body.chat
    if (!chat._id) {
        chat = await Chat.create({ userId: chat.userId, messages: chat.messages })
    } else {
        chat = await Chat.findByIdAndUpdate(chat._id, { $push: { messages: chat.messages[chat.messages.length - 1] } }, { new: true });
    }
    const response = await ToolSelection(chat)
    res.send(response);
});

module.exports = vendorAssistantRouter;