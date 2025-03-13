const Crew = require('../models/crew.model');
const User = require('../models/user.model');

// Get all crew members
const getAllCrewMembers = async (req, res) => {
  try {
    const crewMembers = await Crew.find().populate({
      path: 'user',
      select: 'email isApproved',
      populate: { path: 'role', select: 'name' },
    });

    res.status(200).json({
      status: 'success',
      data: crewMembers,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching crew members',
      error: error.message,
    });
  }
};

// Get crew member by ID
const getCrewMemberById = async (req, res) => {
  try {
    const crewMember = await Crew.findById(req.params.id).populate({
      path: 'user',
      select: 'email isApproved',
      populate: { path: 'role', select: 'name' },
    });

    if (!crewMember) {
      return res.status(404).json({
        status: 'error',
        message: 'Crew member not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: crewMember,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching crew member',
      error: error.message,
    });
  }
};

// Update crew member
const updateCrewMember = async (req, res) => {
  try {
    const crewMember = await Crew.findById(req.params.id);
    if (!crewMember) {
      return res.status(404).json({
        status: 'error',
        message: 'Crew member not found',
      });
    }

    // Handle file uploads if any
    if (req.files) {
      const s3BaseUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

      if (req.files.profilePicture?.[0]) {
        req.body.profilePicture = `${s3BaseUrl}/${req.files.profilePicture[0].key}`;
      }
      if (req.files.cv?.[0]) {
        req.body.cv = `${s3BaseUrl}/${req.files.cv[0].key}`;
      }
      if (req.files.certificationFiles) {
        req.body.certificationFiles = req.files.certificationFiles.map(
          file => `${s3BaseUrl}/${file.key}`
        );
      }
    }

    const updatedCrewMember = await Crew.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: updatedCrewMember,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating crew member',
      error: error.message,
    });
  }
};

// Delete crew member
const deleteCrewMember = async (req, res) => {
  try {
    const crewMember = await Crew.findById(req.params.id);
    if (!crewMember) {
      return res.status(404).json({
        status: 'error',
        message: 'Crew member not found',
      });
    }

    // Remove crew profile reference from user
    await User.findByIdAndUpdate(crewMember.user, {
      $unset: { crewProfile: 1 },
    });

    await Crew.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Crew member deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting crew member',
      error: error.message,
    });
  }
};

// Get crew members by position
const getCrewMembersByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const crewMembers = await Crew.find({ position }).populate({
      path: 'user',
      select: 'email isApproved',
      populate: { path: 'role', select: 'name' },
    });

    res.status(200).json({
      status: 'success',
      data: crewMembers,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching crew members',
      error: error.message,
    });
  }
};

module.exports = {
  getAllCrewMembers,
  getCrewMemberById,
  updateCrewMember,
  deleteCrewMember,
  getCrewMembersByPosition,
};
