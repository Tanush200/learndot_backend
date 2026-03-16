const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        default: ""
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'creator', 'admin'],
        default: 'user'
    },
    purchasedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    completedVideos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
