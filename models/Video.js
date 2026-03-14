const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true
    },
    isFree: {
        type: Boolean,
        default: false
    },
    sequenceId: {
        type: Number,
        required: true
    }

}, { timestamps: true })

module.exports = mongoose.model('Video', videoSchema);