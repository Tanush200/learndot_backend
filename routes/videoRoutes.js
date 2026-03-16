const express = require('express');
const router = express.Router();
const { getCourseVideos, incrementVideoView } = require('../controllers/videoController');

router.get('/course/:courseId', getCourseVideos);
router.post('/videos/:videoId/view', incrementVideoView)

module.exports = router;
