const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 99,
    },
    thumbnailUrl: {
        type: String,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // isPublished: {
    //     type: Boolean,
    //     default: false,
    // }
    status: {
        type: String,
        enum: ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'REJECTED'],
        default: 'DRAFT'
    },
    rejectionReason: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
