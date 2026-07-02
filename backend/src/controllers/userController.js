const userModel = require('../models/usermodel');
const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');

const getUserByEmail = asyncHandler(async(req, res) => {
    const {email} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    return res.status(200).json({user});
});

// Helper: stream a buffer to Cloudinary and return the upload result
const uploadToCloudinary = (buffer, folder = 'avatars') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { name } = req.body;

    // At least one field must be present
    if (!name && !req.file) {
        return res.status(400).json({
            message: 'provide at least one field to update: name or avatar'
        });
    }

    const updates = {};

    if (name) updates.name = name.trim();

    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        updates.avatar = result.secure_url;
    }

    const updated = await userModel.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
    ).select('-password');

    if (!updated) {
        return res.status(404).json({ message: 'user not found' });
    }

    return res.status(200).json({
        message: 'profile updated successfully',
        user: updated
    });
});

module.exports = {
    getUserByEmail,
    updateProfile
};