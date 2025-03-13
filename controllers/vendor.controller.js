const Vendor = require('../models/vendor.model');
const User = require('../models/user.model');

// Get all vendors
const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate({
      path: 'user',
      select: 'email isApproved',
      populate: { path: 'role', select: 'name' },
    });

    res.status(200).json({
      status: 'success',
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching vendors',
      error: error.message,
    });
  }
};

// Get vendor by ID
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate({
      path: 'user',
      select: 'email isApproved',
      populate: { path: 'role', select: 'name' },
    });

    if (!vendor) {
      return res.status(404).json({
        status: 'error',
        message: 'Vendor not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching vendor',
      error: error.message,
    });
  }
};

// Update vendor
const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        status: 'error',
        message: 'Vendor not found',
      });
    }

    // Handle file uploads if any
    if (req.files) {
      const s3BaseUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

      if (req.files.licenseFile?.[0]) {
        req.body.licenseFile = `${s3BaseUrl}/${req.files.licenseFile[0].key}`;
      }
      if (req.files.liabilityInsurance?.[0]) {
        req.body.liabilityInsurance = `${s3BaseUrl}/${req.files.liabilityInsurance[0].key}`;
      }
      if (req.files.taxId?.[0]) {
        req.body.taxId = `${s3BaseUrl}/${req.files.taxId[0].key}`;
      }
      if (req.files.pricingStructure?.[0]) {
        req.body.pricingStructure = `${s3BaseUrl}/${req.files.pricingStructure[0].key}`;
      }
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: updatedVendor,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating vendor',
      error: error.message,
    });
  }
};

// Delete vendor
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        status: 'error',
        message: 'Vendor not found',
      });
    }

    // Remove vendor profile reference from user
    await User.findByIdAndUpdate(vendor.user, {
      $unset: { vendorProfile: 1 },
    });

    await Vendor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting vendor',
      error: error.message,
    });
  }
};

// Get vendors by department
const getVendorsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const vendors = await Vendor.find({ department }).populate({
      path: 'user',
      select: 'email isApproved',
      populate: { path: 'role', select: 'name' },
    });

    res.status(200).json({
      status: 'success',
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching vendors',
      error: error.message,
    });
  }
};

// Get vendors by service area
const getVendorsByServiceArea = async (req, res) => {
  try {
    const { serviceArea } = req.params;
    const vendors = await Vendor.find({ serviceArea }).populate({
      path: 'user',
      select: 'email isApproved',
      populate: { path: 'role', select: 'name' },
    });

    res.status(200).json({
      status: 'success',
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching vendors',
      error: error.message,
    });
  }
};

// Simple get vendors function
const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({});
    if (!vendors) {
      return res.status(404).json({ status: false, message: 'No vendors found' });
    }
    res.status(200).json({ status: true, data: vendors });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching vendors',
      error: error.message,
    });
  }
};

// SINGLE module.exports with ALL functions
module.exports = {
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getVendorsByDepartment,
  getVendorsByServiceArea,
  getVendors
};

