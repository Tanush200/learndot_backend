const express = require("express");
const router = express.Router();
const { getAllCourses, getCourseById, createCourse, updateCourse, addVideoToCourse, adminGrantCourseAccess, getPurchasedCourses, getNewestFreeVideos, getMyCourse, getAdminAllCourses, getCreatorAnalytics } = require("../controllers/courseController");
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAllCourses);
router.get('/feed/newest', getNewestFreeVideos);
router.get('/purchased', protect, getPurchasedCourses);

router.post('/', protect, admin, createCourse);
router.get('/admin/my-courses', protect, admin, getMyCourse);
router.get('/admin/all', protect, admin, getAdminAllCourses);
router.get('/admin/analytics', protect, admin, getCreatorAnalytics)
router.put("/admin/:id/grant-access", protect, admin, adminGrantCourseAccess)

router.get('/:id', getCourseById);
router.post('/:id/videos', protect, admin, addVideoToCourse)
router.put("/:id", protect, admin, updateCourse);

module.exports = router