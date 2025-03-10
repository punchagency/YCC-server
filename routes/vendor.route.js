const { getVendors } = require('../controllers/vendor.controller');
const vendorRouter = require('express').Router();

vendorRouter.get('/', getVendors);

module.exports = vendorRouter;
