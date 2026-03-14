const express = require("express");
const router = express.Router();
const { getAllCourses, getCourseById, createCourse, addVideoToCourse, submitCourseForReview, adminCourseApproval, getNewestFreeVideos, getMyCourse, getAdminAllCourses } = require("../controllers/courseController");
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllCourses);
router.get('/feed/newest', getNewestFreeVideos);
router.get('/:id', getCourseById);
router.post('/', protect, createCourse);

router.post('/:id/videos', protect, addVideoToCourse)
router.put("/:id/submit", protect, submitCourseForReview);
router.put("/admin/:id/approve", protect, adminCourseApproval)
router.get('/creator/my-course', protect, getMyCourse);
router.get('/admin/all', protect, getAdminAllCourses);

module.exports = router