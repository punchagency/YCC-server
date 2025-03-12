const { getSuppliers } = require('../controllers/supplier.controller');
const supplierRouter = require('express').Router();

supplierRouter.get('/', getSuppliers);
module.exports = supplierRouter;
