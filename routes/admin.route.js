const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');
const {
  approveUser,
  rejectUser,
  getUsers,
} = require('../controllers/admin.controller');
const { verifyToken } = require('../utils/jwt.utils');


console.log('verifyToken:', authMiddleware.verifyToken);
console.log('isAdmin:', isAdmin);
console.log('adminController.approveUser:', adminController.approveUser);

// Apply both auth and admin middleware
router.put('/approve/:id', authMiddleware.verifyToken, isAdmin, approveUser);

router.put('/reject/:id', authMiddleware.verifyToken, isAdmin, rejectUser);

router.get('/pending-users', authMiddleware.verifyToken, isAdmin, getUsers);

module.exports = router;
