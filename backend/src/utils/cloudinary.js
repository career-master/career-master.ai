const cloudinary = require('cloudinary').v2;
const { ErrorHandler } = require('../middleware/errorHandler');
const env = require('../config/env');

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {Buffer|string} file - File buffer or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadImage = async (file, options = {}) => {
  try {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new ErrorHandler(500, 'Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    }

    const uploadOptions = {
      folder: options.folder || 'career-master/quiz-images',
      resource_type: 'image',
      ...options
    };

    let uploadResult;
    
    // If file is a buffer, convert to base64
    if (Buffer.isBuffer(file)) {
      const base64String = file.toString('base64');
      const dataUri = `data:image/jpeg;base64,${base64String}`;
      uploadResult = await cloudinary.uploader.upload(dataUri, uploadOptions);
    } else if (typeof file === 'string') {
      // If it's already a base64 string or URL
      if (file.startsWith('data:')) {
        uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
      } else if (file.startsWith('http://') || file.startsWith('https://')) {
        // If it's a URL, upload from URL
        uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
      } else {
        // Assume it's a base64 string without data URI prefix
        const dataUri = `data:image/jpeg;base64,${file}`;
        uploadResult = await cloudinary.uploader.upload(dataUri, uploadOptions);
      }
    } else {
      throw new ErrorHandler(400, 'Invalid file format. Expected buffer or base64 string.');
    }

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format
    };
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw error;
    }
    throw new ErrorHandler(500, `Error uploading image to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new ErrorHandler(500, 'Cloudinary configuration is missing.');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw error;
    }
    throw new ErrorHandler(500, `Error deleting image from Cloudinary: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  cloudinary
};

