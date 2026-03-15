const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const videoRoutes = require('./routes/videoRoutes')
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn('MongoDB URI not found in .env, skipping connection for now.');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

const app = express();

app.use(
    cors({
        origin:
            process.env.NODE_ENV === "production"
                ? ["https://engine-board-frontend.vercel.app"]
                : ["http://localhost:3000"],
        credentials: true,
    })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/videos', videoRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'LearnDot Backend OK', message: 'Backend is running!' });
});



const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
});
