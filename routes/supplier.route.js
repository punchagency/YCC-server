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
} = require('../controllers/supplier.controller');

// Get all suppliers
router.get('/', verifyToken, getAllSuppliers);

// Get supplier by ID
router.get('/:id', verifyToken, getSupplierById);

// Get suppliers by business type
router.get(
  '/business-type/:businessType',
  verifyToken,
  getSuppliersByBusinessType
);

// Get suppliers by service area
router.get(
  '/service-area/:serviceArea',
  verifyToken,
  getSuppliersByServiceArea
);

// Update supplier
router.put('/:id', verifyToken, upload, updateSupplier);

// Delete supplier (admin only)
router.delete('/:id', verifyToken, isAdmin, deleteSupplier);

module.exports = router;
