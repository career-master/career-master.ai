const { asyncHandler } = require('../middleware/errorHandler');
const { uploadImage } = require('../utils/cloudinary');
const multer = require('multer');
const { ErrorHandler } = require('../middleware/errorHandler');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * Upload Controller
 * Handles image uploads to Cloudinary
 */
class UploadController {
  /**
   * POST /upload/image
   * Upload a single image to Cloudinary
   */
  static uploadSingleImage = [
    upload.single('image'),
    asyncHandler(async (req, res, next) => {
      // Handle multer errors
      if (req.fileValidationError) {
        return res.status(400).json({
          success: false,
          message: req.fileValidationError
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      try {
        const folder = req.body.folder || 'career-master/quiz-images';
        
        const result = await uploadImage(req.file.buffer, {
          folder: folder,
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        });

        res.status(200).json({
          success: true,
          message: 'Image uploaded successfully',
          data: {
            url: result.url,
            publicId: result.publicId,
            width: result.width,
            height: result.height,
            format: result.format
          }
        });
      } catch (error) {
        next(error);
      }
    })
  ];

  /**
   * POST /upload/image-base64
   * Upload image from base64 string
   */
  static uploadBase64Image = asyncHandler(async (req, res) => {
    const { image, folder } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    const uploadFolder = folder || 'career-master/quiz-images';
    
    const result = await uploadImage(image, {
      folder: uploadFolder,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  });
}

module.exports = UploadController;

