const Supplier = require('../models/supplier.model');
const User = require('../models/user.model');

// Get all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().populate({
      path: 'user',
      select: 'email isApproved',
      populate: { path: 'role', select: 'name' },
    });

    res.status(200).json({
      status: 'success',
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching suppliers',
      error: error.message,
    });
  }
};

// Get supplier by ID
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate({
      path: 'user',
      select: 'email isApproved',
      populate: { path: 'role', select: 'name' },
    });

    if (!supplier) {
      return res.status(404).json({
        status: 'error',
        message: 'Supplier not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching supplier',
      error: error.message,
    });
  }
};

// Update supplier
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        status: 'error',
        message: 'Supplier not found',
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
      if (req.files.vatTaxId?.[0]) {
        req.body.vatTaxId = `${s3BaseUrl}/${req.files.vatTaxId[0].key}`;
      }
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: updatedSupplier,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating supplier',
      error: error.message,
    });
  }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        status: 'error',
        message: 'Supplier not found',
      });
    }

    // Remove supplier profile reference from user
    await User.findByIdAndUpdate(supplier.user, {
      $unset: { supplierProfile: 1 },
    });

    await Supplier.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting supplier',
      error: error.message,
    });
  }
};

// Get suppliers by business type
const getSuppliersByBusinessType = async (req, res) => {
  try {
    const { businessType } = req.params;
    const suppliers = await Supplier.find({ businessType }).populate({
      path: 'user',
      select: 'email isApproved',
      populate: { path: 'role', select: 'name' },
    });

    res.status(200).json({
      status: 'success',
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching suppliers',
      error: error.message,
    });
  }
};

// Get suppliers by service area
const getSuppliersByServiceArea = async (req, res) => {
  try {
    const { serviceArea } = req.params;
    const suppliers = await Supplier.find({
      serviceAreas: serviceArea,
    }).populate({
      path: 'user',
      select: 'email isApproved',
      populate: { path: 'role', select: 'name' },
    });

    res.status(200).json({
      status: 'success',
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching suppliers',
      error: error.message,
    });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSuppliersByBusinessType,
  getSuppliersByServiceArea,
};
