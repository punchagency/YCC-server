const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
require('dotenv').config();

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const allowedFileTypes = {
  profilePicture: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'],
  cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  certificationFiles: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
};

const fileFilter = (req, file, cb) => {
  if (
    allowedFileTypes[file.fieldname] &&
    allowedFileTypes[file.fieldname].includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}`), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}${fileExtension}`;
      const folder = file.fieldname; // Use the field name as folder name
      cb(null, `${folder}/${fileName}`);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}).fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
  { name: 'certificationFiles', maxCount: 5 },
]);

module.exports = upload;
