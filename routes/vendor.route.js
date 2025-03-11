const { getVendors } = require('../controllers/vendor.controller');
const { updateVendors } = require('../controllers/pineconeDB.controller');
const vendorRouter = require('express').Router();

vendorRouter.get('/', getVendors);
vendorRouter.get('/update-vendors', updateVendors);

module.exports = vendorRouter;
