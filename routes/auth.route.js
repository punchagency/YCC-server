const express = require("express")
const {signup, loginUser, forgotPassword, verifyOtp, resetPassword} = require("../controllers/auth.controller");
const multer = require('multer'); 
const {isAdmin} = require("../middleware/admin.middleware");
const rateLimiter = require("../middleware/rate-limiter");
const {verifyToken} = require("../utils/jwt.utils");
const upload = require("../utils/s3Config");



const router = express.Router()




router.post('/signup', upload,signup);
router.post("/login", rateLimiter, loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);


 
module.exports = router;