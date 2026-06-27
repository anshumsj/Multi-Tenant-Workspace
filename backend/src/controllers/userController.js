const userModel = require('../models/usermodel');
const asyncHandler = require('express-async-handler');

const getUserByEmail = asyncHandler(async(req, res) => {
    const {email} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    return res.status(200).json({user});
});

module.exports = {
    getUserByEmail
};