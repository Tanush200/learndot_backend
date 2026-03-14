const express = require('express');
const router = express.Router();
const { getCourseVideos } = require('../controllers/videoController');

router.get('/course/:courseId', getCourseVideos);

module.exports = router;
