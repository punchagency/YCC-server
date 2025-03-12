const Supplier = require('../models/supplier.model');

const getSuppliers = async (req, res) => {
  const suppliers = await Supplier.find({});
  if (!suppliers) {
    return res.status(404).json({ status: false, message: 'No suppliers found' });
  }
  res.status(200).json({ status: true, data: suppliers });
};


module.exports = { getSuppliers };
