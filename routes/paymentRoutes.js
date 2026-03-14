const express = require('express')
const router = express.Router();

const { initiatePayment, phonePeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/pay', protect, initiatePayment);
router.post('/webhook', phonePeWebhook);

module.exports = router;