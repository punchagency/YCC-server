const express = require('express');
const router = express.Router();
const { getChatById } = require('../controllers/chatController');

// Get a specific chat
router.get('/:id', getChatById);

module.exports = router; 