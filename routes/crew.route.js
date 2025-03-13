const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/jwt.utils');
const { isAdmin } = require('../middleware/admin.middleware');
const upload = require('../utils/s3Config');
const {
  getAllCrewMembers,
  getCrewMemberById,
  updateCrewMember,
  deleteCrewMember,
  getCrewMembersByPosition,
} = require('../controllers/crew.controller');

// Get all crew members
router.get('/', verifyToken, getAllCrewMembers);

// Get crew member by ID
router.get('/:id', verifyToken, getCrewMemberById);

// Get crew members by position
router.get('/position/:position', verifyToken, getCrewMembersByPosition);

// Update crew member
router.put('/:id', verifyToken, upload, updateCrewMember);

// Delete crew member (admin only)
router.delete('/:id', verifyToken, isAdmin, deleteCrewMember);

module.exports = router;
