const aiRouter = require('express').Router();
const basicAssistantRouter = require('../AIAssistants/BasicAssistant/BasicAssistantRouter');
const vendorAssistantRouter = require('../AIAssistants/VendorAssistant/VendorAssistantRouter');

aiRouter.use('/basic', basicAssistantRouter);
aiRouter.use('/vendor', vendorAssistantRouter);

module.exports = aiRouter;

