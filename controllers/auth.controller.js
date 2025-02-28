const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt.utils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/send-email');
const { htmlContent } = require('../files/email-notification');
const otp_verification_template = require('../files/otp-verification');
const random = require('../utils/generate-otp');
const Token = require('../models/otp.model');
const Notification = require('../models/notifications');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('../utils/s3Config');

const signup = async (req, res) => {
  try {
    const { email, password, confirmPassword, role } = req.body;

    let crewDetails = JSON.parse(req.body.crewDetails || '{}');

    // Log received files
    console.log('Received files:', req.files);

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, and confirm password are required.',
      });
    }

    const validRoles = [
      'captain',
      'service_provider',
      'supplier',
      'crew_member',
      'admin',
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role selected',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email. Please enter a valid email address.',
      });
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        status: 'error',
        message:
          'Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords do not match.',
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    }).exec();
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Oops! Account already exists. Please log in.',
      });
    }

    let hashedPassword;
    let tempUsername = null;
    let tempPassword = null;

    if (role === 'crew_member') {
      hashedPassword = await bcrypt.hash(password, 10);
    } else if (role === 'service_provider' || role === 'supplier') {
      tempUsername = `vendor_${Date.now()}`;
      tempPassword = Math.random().toString(36).slice(-8); // Random 8-character password
      hashedPassword = await bcrypt.hash(tempPassword, 10); // Hash temporary password
    } else {
       hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isApproved: role === 'crew_member' ? true : false,
      crewDetails:
        role === 'crew_member'
          ? {
              ...crewDetails,
             
              profilePicture: crewDetails.profilePicture || null,
              cv: crewDetails.cv || null,
              certificationFiles: crewDetails.certificationFiles || [],
            }
          : undefined,
    });

    // Assign role-specific details
    if (role === 'crew_member') {
    

      // Only try to access files if req.files exists
      const s3BaseUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
      if (req.files) {
       
        if (req.files.profilePicture && req.files.profilePicture[0]) {
          crewDetails.profilePicture = `${s3BaseUrl}/${req.files.profilePicture[0].key}`;
        }

        if (req.files.cv && req.files.cv[0]) {
          crewDetails.cv = `${s3BaseUrl}/${req.files.cv[0].key}`;
        }

        if (req.files.certificationFiles) {
          crewDetails.certificationFiles = req.files.certificationFiles.map(
            file => `${s3BaseUrl}/${file.key}`
          );
        }
      }

     

      if (!crewDetails || !crewDetails.position) {
        return res.status(400).json({
          status: 'error',
          message: 'Crew member details are required.',
        });
      }
      newUser.crewDetails = crewDetails;
    }

    if (role === 'supplier') {
      if (!supplierDetails || !supplierDetails.businessName) {
        return res.status(400).json({
          status: 'error',
          message: 'Supplier details are required.',
        });
      }
      newUser.supplierDetails = supplierDetails;
    }

    if (role === 'service_provider') {
      if (!vendorDetails || !vendorDetails.businessName) {
        return res.status(400).json({
          status: 'error',
          message: 'Vendor details are required.',
        });
      }
      newUser.vendorDetails = vendorDetails;
    }

    await sendMail(
      req.body.email,
      'Welcome to Yacht Crew Central! Your Account is Successfully Created',
      htmlContent
        .replace(/{{fullName}}/g, req.body.firstName)
        .replace(/{{lastName}}/g, req.body.lastName)
        .replace(/{{email}}/g, req.body.email)
    );

    await newUser.save();

    const token = generateToken({ userId: newUser._id, role: newUser.role });

    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      const adminEmails = admins.map(admin => admin.email);
      const adminNotificationEmail = `
    <div>
      <h3>New User Signup</h3>
      <p>A new user has signed up and is awaiting approval.</p>
      <p><strong>Full Name:</strong> ${crewDetails.firstName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Role:</strong> ${role}</p>
      <p>Please review and approve/reject the user.</p>
      <p>Best regards,<br>Yacht Crew Central</p>
    </div>
  `;

      // Send email to all admins
      for (const adminEmail of adminEmails) {
        await sendMail(
          adminEmail,
          'New User Signup - Approval Needed',
          adminNotificationEmail
        );
      }
    }

    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      const newNotification = new Notification({
        recipient: admin._id,
        message: `New user ${crewDetails?.firstName || ''} ${
          crewDetails.lastName || ''
        } (${email}) has signed up and is awaiting approval`,
      });
      await newNotification.save();
    }
    res.status(201).json({
      status: 'success',
      message: 'Account created successfully!',
      user: {
        id: newUser._id,
        firstName: crewDetails?.firstName,
        lastname: crewDetails?.lastName,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error('Signup Error:', error);
    if (req.files) {
      try {
        await Promise.all(
          Object.values(req.files)
            .flat()
            .map(file =>
              s3Client.send(
                new DeleteObjectCommand({
                  Bucket: process.env.AWS_BUCKET_NAME,
                  Key: file.key,
                })
              )
            )
        );
      } catch (deleteError) {
        console.error('Error deleting files:', deleteError);
      }
    }
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    console.log('User found:', user);
    if (user.isRejected) {
      return res.status(400).json({
        message:
          'Your account has been rejected, please contact admin for more information',
      });
    }

    if (!user) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Invalid email or password.' });
    }

    if (
      !user.isApproved &&
      user.role !== 'admin' &&
      user.role != 'crew_member'
    ) {
      return res.status(403).json({
        status: 'error',
        message:
          'Your account is pending approval. Please wait for admin approval.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password Match:', isMatch);

    if (!isMatch) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Invalid email or password.' });
    }

    const token = generateToken({ userId: user._id, role: user.role });

    res.status(200).json({
      status: 'success',
      message: 'Login successful!',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Email does not exist!',
      });
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + 5 * 60 * 1000);

    const otp = random(4, '1234567890');
    await sendMail(
      req.body.email,
      'Forgot Password',
      otp_verification_template.replace('{{otp}}', otp)
    );

    await new Token({
      user: user._id,
      token: otp,
      expiry,
    }).save();

    const { password, ...others } = user._doc;

    return res.status(200).json({
      status: 'success',
      message: 'An OTP has been sent to your email address!',
      data: others,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
      error,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found!',
      });
    }

    const token = await Token.findOne({
      user: user._id,
      token: req.body.otp,
    });

    if (!token) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid otp',
      });
    }

    if (token.expiry < Date.now()) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP has expired! request for a new one',
      });
    }

    await token.deleteOne();

    const { password, ...others } = user._doc;

    return res.status(200).json({
      status: 'success',
      message: 'Otp verified!',
      data: others,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found!',
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.findOneAndUpdate(
      { _id: user._id },
      { password: hashedPassword },
      { new: true }
    );

    const { password, ...others } = user._doc;

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successful!',
      data: others,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

module.exports = {
  signup,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
