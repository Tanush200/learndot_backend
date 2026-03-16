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

const incrementVideoView = async (req, res) => {
    try {
        const { videoId } = req.params;
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } })
        res.status(200).json({ message: "View Counted" })
    } catch (error) {
        console.error("Error incrementing view count:", error);
        res.status(500).json({ message: "Server Error" })
    }
}

module.exports = {
    getCourseVideos,
    incrementVideoView
};
