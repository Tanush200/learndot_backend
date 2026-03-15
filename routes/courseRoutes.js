const express = require("express");
const router = express.Router();
const { getAllCourses, getCourseById, createCourse, updateCourse, addVideoToCourse, submitCourseForReview, adminCourseApproval, adminGrantCourseAccess, getPurchasedCourses, getNewestFreeVideos, getMyCourse, getAdminAllCourses } = require("../controllers/courseController");
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllCourses);
router.get('/feed/newest', getNewestFreeVideos);
router.post('/', protect, createCourse);

router.get('/creator/my-course', protect, getMyCourse);
router.get('/admin/all', protect, getAdminAllCourses);
router.get('/purchased', protect, getPurchasedCourses);

// Dynamic ID routes must go last
router.get('/:id', getCourseById);
router.post('/:id/videos', protect, addVideoToCourse)
router.put("/:id", protect, updateCourse);
router.put("/:id/submit", protect, submitCourseForReview);
router.put("/admin/:id/approve", protect, adminCourseApproval)
router.put("/admin/:id/grant-access", protect, adminGrantCourseAccess)

module.exports = router