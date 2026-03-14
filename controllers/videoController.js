const Video = require('../models/Video');

const getCourseVideos = async (req, res) => {
    try {
        const videos = await Video.find({ courseId: req.params.courseId }).sort({ sequenceId: 1 });
        res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching course videos:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getCourseVideos
};
