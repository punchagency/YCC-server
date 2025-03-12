const User = require('../models/user.model');
const Role = require('../models/role.model');
const Crew = require('../models/crew.model');
const Vendor = require('../models/vendor.model');
const Supplier = require('../models/supplier.model');
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
    const { email, password, confirmPassword, role: roleName } = req.body;

    // Basic validation
    if (!email || !roleName) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and role are required.',
      });
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format.',
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists.',
      });
    }

    // Find role
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role selected.',
      });
    }

    // Password validation based on role
    let hashedPassword;
    if (!['service_provider', 'supplier'].includes(roleName)) {
      if (!password || !confirmPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Password and confirmation are required.',
        });
      }
      if (password.length < 8) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 8 characters.',
        });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Passwords do not match.',
        });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // Generate temporary password for service providers and suppliers
      const tempPassword = Math.random().toString(36).slice(-8);
      hashedPassword = await bcrypt.hash(tempPassword, 10);
    }

    // Create base user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role._id,
      isApproved: roleName === 'crew_member',
    });

    // Handle role-specific profile creation
    if (roleName === 'crew_member') {
      const crewDetails = JSON.parse(req.body.crewDetails || '{}');

      if (
        !crewDetails.firstName ||
        !crewDetails.lastName ||
        !crewDetails.position
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'Crew member details are incomplete.',
        });
      }

      // Handle file uploads
      if (req.files) {
        const s3BaseUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
        // for crew
        if (req.files.profilePicture?.[0]) {
          crewDetails.profilePicture = `${s3BaseUrl}/${req.files.profilePicture[0].key}`;
        }
        if (req.files.cv?.[0]) {
          crewDetails.cv = `${s3BaseUrl}/${req.files.cv[0].key}`;
        }
        if (req.files.certificationFiles) {
          crewDetails.certificationFiles = req.files.certificationFiles.map(
            file => `${s3BaseUrl}/${file.key}`
          );
        }
        // for vendor
        if (req.files.licenseFile?.[0]) {
          crewDetails.licenseFile = `${s3BaseUrl}/${req.files.licenseFile[0].key}`;
        }
        if (req.files.pricingStructure?.[0]) {
          crewDetails.pricingStructure = `${s3BaseUrl}/${req.files.pricingStructure[0].key}`;
        }
        if (req.files.liabilityInsurance?.[0]) {
          crewDetails.liabilityInsurance = `${s3BaseUrl}/${req.files.liabilityInsurance[0].key}`;
        }
        if (req.files.taxId?.[0]) {
          crewDetails.taxId = `${s3BaseUrl}/${req.files.taxId[0].key}`;
        }

        // for supplier
        if (req.files.licenseSupplierFile?.[0]) {
          crewDetails.licenseSupplierFile = `${s3BaseUrl}/${req.files.licenseSupplierFile[0].key}`;
          console.log(crewDetails.licenseSupplierFile);
        }
        if (req.files.supplierVatTaxId?.[0]) {
          crewDetails.supplierVatTaxId = `${s3BaseUrl}/${req.files.supplierVatTaxId[0].key}`;
          console.log(crewDetails.supplierVatTaxId);
        }
        if (req.files.supplierLiabilityInsurance?.[0]) {
          crewDetails.supplierLiabilityInsurance = `${s3BaseUrl}/${req.files.supplierLiabilityInsurance[0].key}`;
          console.log(crewDetails.supplierLiabilityInsurance);
        }
        if (req.files.spreadsheetFile?.[0]) {
          crewDetails.spreadsheetFile = `${s3BaseUrl}/${req.files.spreadsheetFile[0].key}`;
          console.log(crewDetails.spreadsheetFile);
        }
      }

      const crew = new Crew({
        user: newUser._id,
        ...crewDetails,
      });
      await crew.save();
      newUser.crewProfile = crew._id;
    } else if (roleName === 'service_provider') {
      let vendorDetails = req.body.vendorDetails;
      try {
        if (typeof vendorDetails === 'string') {
          vendorDetails = JSON.parse(vendorDetails);
        }
      } catch (e) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid vendor details format.',
        });
      }

      if (!vendorDetails?.businessName || !vendorDetails?.department) {
        return res.status(400).json({
          status: 'error',
          message: 'Vendor details are incomplete.',
        });
      }

      // Handle file uploads
      if (req.files) {
        const s3BaseUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
        if (req.files.licenseFile?.[0]) {
          vendorDetails.licenseFile = `${s3BaseUrl}/${req.files.licenseFile[0].key}`;
        }
        if (req.files.liabilityInsurance?.[0]) {
          vendorDetails.liabilityInsurance = `${s3BaseUrl}/${req.files.liabilityInsurance[0].key}`;
        }
        if (req.files.taxId?.[0]) {
          vendorDetails.taxId = `${s3BaseUrl}/${req.files.taxId[0].key}`;
        }
      }

      const vendor = new Vendor({
        user: newUser._id,
        ...vendorDetails,
      });
      await vendor.save();
      newUser.vendorProfile = vendor._id;
    } else if (roleName === 'supplier') {
      // Get the S3 URLs for uploaded files
      const s3BaseUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

      if (req.files) {
        const supplierDetails = JSON.parse(req.body.supplierDetails);

        // Update file URLs in supplierDetails
        if (req.files.licenseSupplierFile?.[0]) {
          supplierDetails.licenseSupplierFile = `${s3BaseUrl}/${req.files.licenseSupplierFile[0].key}`;
        }
        if (req.files.supplierVatTaxId?.[0]) {
          supplierDetails.supplierVatTaxId = `${s3BaseUrl}/${req.files.supplierVatTaxId[0].key}`;
        }
        if (req.files.supplierLiabilityInsurance?.[0]) {
          supplierDetails.supplierLiabilityInsurance = `${s3BaseUrl}/${req.files.supplierLiabilityInsurance[0].key}`;
        }
        if (req.files.spreadsheetFile?.[0]) {
          supplierDetails.spreadsheetFile = `${s3BaseUrl}/${req.files.spreadsheetFile[0].key}`;
        }

        // Update req.body.supplierDetails with the new URLs
        req.body.supplierDetails = JSON.stringify(supplierDetails);
      }

      let supplierDetails = req.body.supplierDetails;
      try {
        if (typeof supplierDetails === 'string') {
          supplierDetails = JSON.parse(supplierDetails);
        }
      } catch (e) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid supplier details format.',
        });
      }

      if (!supplierDetails?.businessName || !supplierDetails?.businessType) {
        return res.status(400).json({
          status: 'error',
          message: 'Supplier details are incomplete.',
        });
      }

      // Handle file uploads
      if (req.files) {
        const s3BaseUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
        if (req.files.licenseFile?.[0]) {
          supplierDetails.licenseFile = `${s3BaseUrl}/${req.files.licenseFile[0].key}`;
        }
        if (req.files.liabilityInsurance?.[0]) {
          supplierDetails.liabilityInsurance = `${s3BaseUrl}/${req.files.liabilityInsurance[0].key}`;
        }
        if (req.files.vatTaxId?.[0]) {
          supplierDetails.vatTaxId = `${s3BaseUrl}/${req.files.vatTaxId[0].key}`;
        }
      }

      const supplier = new Supplier({
        user: newUser._id,
        ...supplierDetails,
      });
      await supplier.save();
      newUser.supplierProfile = supplier._id;
    }

    // Save user and send notifications
    await newUser.save();
    await newUser.populate('role');

    // Populate the appropriate profile
    let profile;
    if (newUser.crewProfile) {
      await newUser.populate('crewProfile');
      profile = newUser.crewProfile;
    } else if (newUser.vendorProfile) {
      await newUser.populate('vendorProfile');
      profile = newUser.vendorProfile;
    } else if (newUser.supplierProfile) {
      await newUser.populate('supplierProfile');
      profile = newUser.supplierProfile;
    }

    // Generate token
    const token = generateToken({
      userId: newUser._id,
      role: newUser.role.name,
    });

    // Notify admins
    const admins = await User.find().populate({
      path: 'role',
      match: { name: 'admin' },
    });

    if (admins.length > 0) {
      const adminEmails = admins.map(admin => admin.email);
      const adminNotificationEmail = `
    <div>
      <h3>New User Signup</h3>
      <p>A new user has signed up and is awaiting approval.</p>
      <p><strong>Email:</strong> ${email}</p>
          <p><strong>Role:</strong> ${roleName}</p>
      <p>Please review and approve/reject the user.</p>
    </div>
  `;

      for (const adminEmail of adminEmails) {
        await sendMail(
          adminEmail,
          'New User Signup - Approval Needed',
          adminNotificationEmail
        );
      }

      // Create notifications for admins
      for (const admin of admins) {
        await new Notification({
          recipient: admin._id,
          message: `New user ${email} has signed up as ${roleName} and is awaiting approval`,
        }).save();
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully!',
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role.name,
          isApproved: newUser.isApproved,
          profile,
        },
        token,
      },
    });
  } catch (error) {
    // If there's an error, clean up any uploaded files
    if (req.files) {
      await deleteUploadedFiles(req.files);
    }

    console.warn('Signup Error:', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to create account',
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required.',
      });
    }

    // Find user and populate role and profile
    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('role')
      .populate('crewProfile')
      .populate('vendorProfile')
      .populate('supplierProfile');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials.',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials.',
      });
    }

    // Check approval status
    if (
      !user.isApproved &&
      !['admin', 'crew_member'].includes(user.role.name)
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Account pending approval. Please wait for admin approval.',
      });
    }

    // Get the appropriate profile
    const profile =
      user.crewProfile || user.vendorProfile || user.supplierProfile;

    // Generate token
    const token = generateToken({ userId: user._id, role: user.role.name });

    res.status(200).json({
      status: 'success',
      message: 'Login successful!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role.name,
          isApproved: user.isApproved,
          profile,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during login.',
      error: error.message,
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

// If there's an error, delete uploaded files
const deleteUploadedFiles = async files => {
  try {
    if (!files) return;

    const deletePromises = Object.values(files)
      .flat()
      .map(async file => {
        if (!file || !file.key) return;

        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: file.key,
        };

        try {
          await s3Client.send(new DeleteObjectCommand(deleteParams));
          console.log(`Deleted file: ${file.key}`);
        } catch (err) {
          console.error(`Error deleting file ${file.key}:`, err);
        }
      });

    await Promise.all(deletePromises);
  } catch (err) {
    console.error('Error in deleteUploadedFiles:', err);
  }
};

module.exports = {
  signup,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
