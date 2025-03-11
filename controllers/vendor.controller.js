const Vendor = require('../models/vendor.model');

const getVendors = async (req, res) => {
  const vendors = await Vendor.find({});
  if (!vendors) {
    return res.status(404).json({ status: false, message: 'No vendors found' });
  }
  res.status(200).json({ status: true, data: vendors });
};

module.exports = { getVendors };
