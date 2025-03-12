const aiRouter = require('express').Router();
const basicAssistantRouter = require('../AIAssistants/BasicAssistant/BasicAssistantRouter');

aiRouter.use('/basic', basicAssistantRouter);

module.exports = aiRouter;

