const Course = require("../models/Course")
const Video = require("../models/Video")

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'PUBLISHED' }).populate('creator', 'name');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.messafe });
    }
}




const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('creator', 'name');
        if (course) {
            const videos = await Video.find({ courseId: course._id }).sort({ sequenceId: 1 }).select('-__v');
            res.json({ course, videos })
        } else {
            res.status(404).json({ message: 'Course not found' })
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message })
    }
}




const createCourse = async (req, res) => {
    const { title, description, price, thumbnailUrl } = req.body;

    if (!title || !description || !price) {
        return res.status(400).json({ message: 'Title, description, and price are required' });
    }
    try {
        const course = new Course({
            title,
            description,
            price: price || 99,
            creator: req.user._id,
            status: 'DRAFT'
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}




const addVideoToCourse = async (req, res) => {
    const { title, videoUrl, duration, isFree, sequenceId } = req.body;

    const courseId = req.params.id;

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const video = new Video({
            courseId: course._id,
            title,
            videoUrl,
            duration: duration || 0,
            isFree: isFree || false,
            sequenceId: sequenceId
        });

        const savedVideo = await video.save();
        res.status(201).json(savedVideo);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }


}



const submitCourseForReview = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to publish this course' });
        }


        course.status = 'IN_REVIEW';
        const updatedCourse = await course.save();

        res.json({ message: 'Course submitted for admin review!', course: updatedCourse });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}



const adminCourseApproval = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { status, rejectionReason } = req.body;

        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (status == 'REJECTED' && !rejectionReason) {
            return res.status(400).json({ message: 'Must provide a rejection reason' });
        }

        course.status = status;
        if (status === 'REJECTED') {
            course.rejectionReason = rejectionReason;
        }

        const updatedCourse = await course.save();
        res.json({ message: 'Course status updated', course: updatedCourse });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}




const getNewestFreeVideos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const newestVideosFeed = await Video.aggregate([
            { $match: { isFree: true } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: "$courseInfo" },
            { $match: { "courseInfo.status": 'PUBLISHED' } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        const totalVideos = await Video.countDocuments({ isFree: true });

        res.json({
            videos: newestVideosFeed,
            currentPage: page,
            totalPages: Math.ceil(totalVideos / limit),
            hasMore: page * limit < totalVideos
        })
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}


const getMyCourse = async (req, res) => {
    try {
        const courses = await Course.find({ creator: req.user._id }).sort({ createdAt: -1 })
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching creator courses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}



const getAdminAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({}).populate('creator', 'name email').sort({ createdAt: -1 })
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching admin courses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}




module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    addVideoToCourse,
    submitCourseForReview,
    adminCourseApproval,
    getNewestFreeVideos,
    getMyCourse,
    getAdminAllCourses
}