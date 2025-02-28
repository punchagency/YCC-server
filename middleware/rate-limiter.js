const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    max: 3, // Allow only 4 failed attempts
    message: { status: "error", message: "Too many login attempts. Try again in 30 seconds." },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = loginLimiter;