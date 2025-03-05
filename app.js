require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const app = express();
const authRoutes = require('./routes/auth.route');
const connectDB = require('./config/db');
const multer = require('multer');
const adminRoutes = require('./routes/admin.route');
const { S3Client } = require('@aws-sdk/client-s3');

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
  console.log(req.body)
  console.log(req.file)
  req.file.buffer
  res.send({})
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

connectDB();
app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});
