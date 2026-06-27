const usermodel = require('../models/usermodel');
const otpmodel = require('../models/otpmodel');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const { sendOtpEmail } = require('../services/emailServices');
const asyncHandler = require('express-async-handler');
require('dotenv').config();

const register = asyncHandler(async (req, res) => {
    const {name, email, password, avatar} = req.body;
    
    if(!name || !email || !password){
        return res.status(400).json({ message: "please enter all the fields" });
    }
    
    const existinguser = await usermodel.findOne({email});
    if(existinguser){
        return res.status(400).json({ message: "user already exists with this email" });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const newuser = await usermodel.create({ name, email, password:hash, avatar });
    const token = JWT.sign({id:newuser._id}, process.env.JWT_SECRET, {expiresIn:'1d'});
    
    res.status(201).json({
        message: "user registered successfully",
        user: newuser,
        token: token
    });
});

const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({ message: "please enter email and password both" });
    }
    const normalizedEmail = email.toLowerCase();
    
    const existinguser = await usermodel.findOne({email:normalizedEmail}).select('+password');
    if(!existinguser){
        return res.status(401).json({ message: "no user found with this email" });
    }
    
    const ismatch = await bcrypt.compare(password, existinguser.password);
    if(!ismatch){
        return res.status(401).json({ message: "invalid password" });
    }
    
    const token = JWT.sign({id:existinguser._id}, process.env.JWT_SECRET, {expiresIn:'1d'});
    res.cookie('token', token, { httpOnly: true });
    
    return res.status(200).json({
        message: "user logged in successfully",
        user: existinguser,
        token: token
    });
});

const logout = asyncHandler(async (req, res) => {
    res.clearCookie('token', { httpOnly: true });
    return res.status(200).json({ message: "user logged out successfully" });
});

const generateOtp = asyncHandler(async (req, res) => {
    let {email} = req.body;
    if(!email){
        return res.status(400).json({ message: "email is required" });
    }
    email = email.toLowerCase();
    
    const existinguser = await usermodel.findOne({email});
    if(!existinguser){
        return res.status(404).json({ message: "no user found with this email" });
    }
    
    await otpmodel.deleteMany({email});
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await otpmodel.create({
        email: email,
        otp: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    
    await sendOtpEmail(email, otp);
    return res.status(200).json({ message: "otp sent to email successfully" });
});

const verifyOtp = asyncHandler(async (req, res) => {
    let {email, otp} = req.body;
    email = email.toLowerCase();
    otp = String(otp).trim();
    if(!email || !otp){
        return res.status(400).json({ message: "email and otp both are required" });
    }
    
    const otprecord = await otpmodel.findOne({email});
    if(!otprecord){ return res.status(400).json({message:"otp not found"}); }
    if(String(otprecord.otp).trim() !== otp){ return res.status(400).json({message:"invalid otp"}); }
    if(Date.now() > otprecord.expiresAt){ return res.status(400).json({message:"otp expired"}); }
    
    await otpmodel.deleteOne({email});
    const resetToken = JWT.sign({email:email}, process.env.JWT_SECRET, {expiresIn:'15m'});
    
    return res.status(200).json({
        message: "otp verified successfully",
        resetToken: resetToken
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const {newPassword, resetToken} = req.body;
    if(!newPassword || !resetToken){
        return res.status(400).json({ message: "new password and reset token both are required" });
    }
    
    const decoded = JWT.verify(resetToken, process.env.JWT_SECRET);
    const email = decoded.email;
    
    const hash = await bcrypt.hash(newPassword, 10);
    await usermodel.findOneAndUpdate({email:email}, {password:hash});
    
    return res.status(200).json({ message: "password changed successfully" });
});

module.exports = {
    register, login, logout, changePassword, generateOtp, verifyOtp
};