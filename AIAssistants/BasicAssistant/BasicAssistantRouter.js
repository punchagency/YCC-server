    const basicAssistantRouter = require('express').Router();
    const ToolSelection = require('./tools/toolSelector');

basicAssistantRouter.post('/', async (req,res)=>{
    const messages = req.body.messages;
    const response = await ToolSelection(messages)
    res.send(response);
});

module.exports = basicAssistantRouter;