const axios = require('axios');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const crypto = require('crypto');

const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const WEBHOOK_USERNAME = process.env.PHONEPE_WEBHOOK_USERNAME;
const WEBHOOK_PASSWORD = process.env.PHONEPE_WEBHOOK_PASSWORD;


const PHONEPE_OAUTH_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";
const PHONEPE_PAY_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay";



const generateToken = async () => {
    const params = new URLSearchParams();
    params.append('client_id', PHONEPE_CLIENT_ID);
    params.append('client_secret', PHONEPE_CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');
    params.append('client_version', '1');

    try {
        const response = await axios.post(PHONEPE_OAUTH_URL, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data.access_token;
    } catch (error) {
        console.error("Error generating PhonePe Token:", error.response?.data || error.message);
        throw new Error("PhonePe Auth failed");
    }
}



const initiatePayment = async (req, res) => {
    try {
        const { courseId, amount } = req.body;
        const userId = req.user._id;

        const accessToken = await generateToken();

        const merchantOrderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        await Transaction.create({
            user: userId,
            course: courseId,
            phonePeTransactionId: merchantOrderId,
            amount: amount,
            status: 'PENDING'
        });

        const payload = {
            merchantOrderId: merchantOrderId,
            amount: amount * 100,
            paymentFlow: {
                type: "PG_CHECKOUT",
                message: "Purchase Microlearning Guide",
                merchantUrl: `http://localhost:3000/status/${merchantOrderId}`
            }
        }

        const response = await axios.post(PHONEPE_PAY_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${accessToken}`
            }
        });

        res.status(200).json({ url: response.data.redirectUrl });
    } catch (error) {
        console.error("Payment Initiation Error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to initiate payment", error: error.response?.data || error.message });
    }
}


const phonePeWebhook = async (req, res) => {
    try {
        const receivedAuth = req.headers.authorization;
        const stringToHash = `${WEBHOOK_USERNAME}:${WEBHOOK_PASSWORD}`;
        const expectedAuthHash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const expectedAuth = expectedAuthHash;

        if (receivedAuth != expectedAuth) {
            console.error("Webhook verification failed. Unauthorized attempt.");
            return res.status(401).json({ message: "Unauthorized Webhook Call" });
        }

        const { event, payload } = req.body;

        if (event === 'checkout.order.completed') {
            const merchantOrderId = payload.merchantOrderId;
            const paymentState = payload.state;

            const transaction = await Transaction.findOne({ phonePeTransactionId: merchantOrderId });

            if (transaction) {
                const isSuccess = paymentState === 'COMPLETED';

                transaction.status = isSuccess ? 'SUCCESS' : 'FAILED';
                await transaction.save();

                if (isSuccess) {
                    await User.findByIdAndUpdate(
                        transaction.user,
                        {
                            $addToSet: { purchasedCourses: transaction.course }
                        }
                    );
                } else {
                    console.error(`Transaction ${merchantOrderId} from Webhook not found in DB`);
                }
            } else if (event === 'checkout.order.failed') {
                const transaction = await Transaction.findOne({ phonePeTransactionId: payload.merchantOrderId });
                if (transaction) {
                    transaction.status = 'FAILED';
                    await transaction.save();
                }
            }
            res.status(200).json({ success: true });
        } else {
            console.error("Invalid event type received from PhonePe Webhook");
            res.status(400).json({ message: "Invalid event type" });
        }
    } catch (error) {
        console.error("Error processing PhonePe Webhook:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
module.exports = {
    initiatePayment,
    phonePeWebhook
}