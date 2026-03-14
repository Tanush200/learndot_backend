const express = require('express');
const router = express.Router();
const { registerUser, loginUser, approveCreator, getPendingCreators } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.put("/approve/:id", protect, approveCreator)
router.get('/creators/pending', protect, getPendingCreators)

module.exports = router;
