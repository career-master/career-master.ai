const express = require('express');
const UploadController = require('./upload.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

const router = express.Router();

// Only authenticated users can upload images
const uploadMiddleware = [authenticate];

// Admin-only upload routes
const adminUploadMiddleware = [authenticate, requireRole(['super_admin', 'content_admin'])];

// Upload single image (file upload)
router.post('/image', uploadMiddleware, UploadController.uploadSingleImage);

// Upload image from base64 string
router.post('/image-base64', uploadMiddleware, UploadController.uploadBase64Image);

module.exports = router;

