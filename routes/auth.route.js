const express = require('express');
const router = express.Router();
const {
  signup,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require('../controllers/auth.controller');
const { isAdmin } = require('../middleware/admin.middleware');
const rateLimiter = require('../middleware/rate-limiter');
const upload = require('../utils/s3Config');

// Remove rate limiter temporarily for testing
router.post('/signup', upload, signup);
router.post('/login', loginUser); // Remove rateLimiter temporarily
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
