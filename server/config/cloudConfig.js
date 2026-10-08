const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Storage config for Club/Project images (existing — do NOT modify)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Club_Projects',
    allowedFormats: ['png', 'jpg', 'jpeg'],
  },
});

// Storage config for Team Member photos (new — separate folder)
const teamStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Team_Members',
    allowedFormats: ['png', 'jpg', 'jpeg'],
    // Resize to a consistent portrait size (600x800) for card display
    transformation: [{ width: 600, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

module.exports = {
  cloudinary,
  storage,
  teamStorage,
};