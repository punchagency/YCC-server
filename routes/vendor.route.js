const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/jwt.utils');
const { isAdmin } = require('../middleware/admin.middleware');
const upload = require('../utils/s3Config');
const {
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getVendorsByDepartment,
  getVendorsByServiceArea,
} = require('../controllers/vendor.controller');

// Get all vendors
router.get('/', verifyToken, getAllVendors);

// Get vendor by ID
router.get('/:id', verifyToken, getVendorById);

// Get vendors by department
router.get('/department/:department', verifyToken, getVendorsByDepartment);

// Get vendors by service area
router.get('/service-area/:serviceArea', verifyToken, getVendorsByServiceArea);

// Update vendor
router.put('/:id', verifyToken, upload, updateVendor);

// Delete vendor (admin only)
router.delete('/:id', verifyToken, isAdmin, deleteVendor);

module.exports = router;
