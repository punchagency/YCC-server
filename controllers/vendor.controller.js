const Vendor = require('../models/vendor.model');

const getVendors = async (req, res) => {
  const vendors = await Vendor.find({});
  if (!vendors) {
    return res.status(404).json({ status: false, message: 'No vendors found' });
  }
  res.status(200).json({ status: true, data: vendors });
};

const getVendorByBusinessName = async (name) => {
  try {
    const vendor = await Vendor.findOne({ businessName: name }).populate('services');
    console.log('vendor from getVendorByBusinessName', vendor)
    if (!vendor) {
      return { status: false, message: 'Vendor not found' };
    }
    return vendor
  } catch (error) {
    console.error(error);
    return { status: false, message: 'Internal server error' };
  }
};

module.exports = { getVendors, getVendorByBusinessName };
