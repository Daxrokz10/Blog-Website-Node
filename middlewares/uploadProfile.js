const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../configs/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'inkwell/profiles', // keep profile pics separate
    allowed_formats: ['jpg','jpeg','png','webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }], // square avatar style
  },
});

module.exports = multer({ storage });
