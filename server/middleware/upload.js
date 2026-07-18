const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatapp/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});

// Cloudinary storage for files (raw)
const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatapp/files',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'mp3', 'mp4', 'wav'],
  },
});

// Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatapp/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images and common document/audio types
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'), false);
  }
};

// Upload multer instances
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
}).single('image');

const uploadFile = multer({
  storage: fileStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter,
}).single('file');

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
}).single('avatar');

// Middleware wrapper that handles multer errors
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = {
  uploadImage: handleUpload(uploadImage),
  uploadFile: handleUpload(uploadFile),
  uploadAvatar: handleUpload(uploadAvatar),
};
