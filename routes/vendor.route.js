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
  getVendors
} = require('../controllers/vendor.controller');

// Get all vendors
router.get('/', getAllVendors);

// Get simple vendors list
router.get('/list', getVendors);

// Get vendors by department - must come before /:id route
router.get('/department/:department', getVendorsByDepartment);

// Get vendors by service area - must come before /:id route
router.get('/service-area/:serviceArea', getVendorsByServiceArea);

// Get vendor by ID - must come after other specific routes
router.get('/:id', getVendorById);

// Update vendor
router.put('/:id', verifyToken, upload, updateVendor);

// Delete vendor (admin only)
router.delete('/:id', verifyToken, isAdmin, deleteVendor);

module.exports = router;

