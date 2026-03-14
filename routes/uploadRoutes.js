const express = require('express');
const router = express.Router();
const { getPresignedUrl } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.post('/presigned-url', protect, getPresignedUrl);

module.exports = router;
