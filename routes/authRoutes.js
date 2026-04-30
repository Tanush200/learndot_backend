const express = require('express');
const router = express.Router();
const { registerUser, loginUser, approveCreator, getPendingCreators, getMe, markVideoCompleted, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.put("/approve/:id", protect, approveCreator)
router.get('/creators/pending', protect, getPendingCreators)
router.get('/me', protect, getMe)
router.post('/progress', protect, markVideoCompleted)

module.exports = router;
