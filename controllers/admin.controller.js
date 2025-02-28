const User = require('../models/user.model');
const {
  sendApprovalEmail,
  sendRejectionEmail,
} = require('../files/email-notification');

const sendMail = require('../utils/send-email');

const approveUser = async (req, res) => {
  console.log('Approve user endpoint hit');
  console.log('Request params:', req.params);
  console.log('User from token:', req.user);

  try {
    console.log('Approving user with ID:', req.params.id); 

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!user) {
      console.log('User not found'); 
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log('User approved successfully:', user); 
    await sendMail(
      user.email,
      'Your account has been approved',
      sendApprovalEmail
        .replace(/{{fullName}}/g, user.fullName)
        .replace(/{{email}}/g, user.email)
    );
    return res
      .status(200)
      .json({ message: 'User approved successfully.', user });
  } catch (error) {
    console.error('Error in approveUser:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

const rejectUser = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // user.isRejected = true;
    user.rejectionReason = rejectionReason;
    await user.save();

    await sendMail(
      user.email,
      'Your account has been rejected',
      sendRejectionEmail
        .replace(/{{fullName}}/g, user.fullName)
        .replace(/{{email}}/g, user.email)
        .replace(/{{rejectionReason}}/g, rejectionReason)
    );
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'User rejected successfully' });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    if (users.length === 0) {
      return res.status(200).json({ message: ' No users found ' });
    }
    res.status(200).json({ message: 'users fetched successfully', users });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { approveUser, rejectUser, getUsers };
