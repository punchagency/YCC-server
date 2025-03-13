const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/jwt.utils');
const { isAdmin } = require('../middleware/admin.middleware');
const upload = require('../utils/s3Config');
const {
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSuppliersByBusinessType,
  getSuppliersByServiceArea,
  getSuppliers,
} = require('../controllers/supplier.controller');

// Get all suppliers
router.get('/', getAllSuppliers);

// Get simple suppliers list
router.get('/list', getSuppliers);

// Get suppliers by business type - must come before /:id route
router.get('/business-type/:businessType', getSuppliersByBusinessType);

// Get suppliers by service area - must come before /:id route
router.get('/service-area/:serviceArea', getSuppliersByServiceArea);

// Get supplier by ID - must come after other specific routes
router.get('/:id', getSupplierById);

// Update supplier
router.put('/:id', verifyToken, upload, updateSupplier);

// Delete supplier (admin only)
router.delete('/:id', verifyToken, isAdmin, deleteSupplier);

module.exports = router;
