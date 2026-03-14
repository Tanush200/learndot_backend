const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const { name, email, password, role, phoneNumber } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (role === 'creator' && !phoneNumber) {
            return res.status(400).json({ message: 'Phone number is required for creator' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            phoneNumber: phoneNumber || "",
            isApproved: role === 'creator' ? false : true
        });

        if (user.role === 'creator') {
            return res.status(201).json({ message: 'Creator account created successfully. Please wait for Admin approval.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isApproved) {
                return res.status(403).json({ message: 'Your account is not approved yet. Please contact the admin.' });
            }
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d',
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const approveCreator = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const creator = await User.findById(req.params.id);
        if (!creator) return res.status(404).json({ message: 'User not found' });

        creator.isApproved = true;
        await creator.save();

        res.json({ message: 'Creator account has been approved!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


const getPendingCreators = async (req, res) => {
    try {
        const pendingCreators = await User.find({ role: 'creator', isApproved: false }).select('-password');
        res.status(200).json(pendingCreators);
    } catch (error) {
        console.error('Error fetching pending creators:', error);
        res.status(500).json({ message: 'Server error fetching creators' });
    }
};
module.exports = {
    registerUser,
    loginUser,
    approveCreator,
    getPendingCreators
};
