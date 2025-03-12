    const basicAssistantRouter = require('express').Router();
    const ToolSelection = require('./tools/toolSelector');
    const Chat = require('../../models/chat.model');

basicAssistantRouter.post('/', async (req,res)=>{

    let chat = req.body.chat
    console.log(chat)
    if(!chat._id){
     chat = await Chat.create({messages: chat.messages})
     console.log('chat created', chat)
    }else{
    console.log('chat.messages', chat.messages)
    chat = await Chat.findByIdAndUpdate(chat._id, { $push: { messages: chat.messages[chat.messages.length - 1] } }, { new: true });
    }
    console.log('new chat', chat)
    const response = await ToolSelection(chat)
    res.send(response);
});

module.exports = basicAssistantRouter;