require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const app = express();
const authRoutes = require('./routes/auth.route');
const adminRoutes = require('./routes/admin.route');
const crewRoutes = require('./routes/crew.route');
const vendorRoutes = require('./routes/vendor.route');
const supplierRoutes = require('./routes/supplier.route');
const connectDB = require('./config/db');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const initializeRoles = require('./utils/init-roles');

app.use(express.json());

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },

  region: bucketRegion,
});

app.use(cors({ origin: '*', credentials: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/post', upload.single('avatar'), async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  req.file.buffer;
  res.send({});
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/crew', crewRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/suppliers', supplierRoutes);

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected');

    // Initialize roles after database connection
    await initializeRoles();
    console.log('Roles initialized');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();
