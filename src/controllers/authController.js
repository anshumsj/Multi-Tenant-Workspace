const usermodel = require('../models/usermodel');
const otpmodel = require('../models/otpmodel');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const { sendOtpEmail } = require('../services/emailServices');
require('dotenv').config();

const register = async (req,res)=>{
    // we take the data from the request body
   
    // we check if the user alreay exists or not 
    try{
        const {name,email,password,avatar} = req.body;
        // req validation
      if(!name || !email || !password){
        return res.status(400).json({
            message:"please enter all the fields"
        })
      }
        const existinguser = await usermodel.findOne({email});
        if(existinguser){
            return res.status(400).json({
                message:"user already exists with this email"
            })
        }
        // if user does not exist then we will hash the password and create a new user
        const hash = await bcrypt.hash(password,10);
        const newuser = await usermodel.create({
            name,email,password:hash,avatar
        })
        const token = JWT.sign({id:newuser._id},process.env.JWT_SECRET,{expiresIn:'1d'})
        res.status(201).json({
            message:"user registered successfully",
            user : newuser,
            token : token
        })
    }catch(error){
        res.status(500).json({
            message:"error registering user",
            error : error.message
        })
    }
}

const login = async (req,res)=>{
        
        try{
                // validate the request body 
                const {email,password} = req.body;
                if(!email || !password){
                    return res.status(400).json({
                        message:"please enter email and password both"
                    })
                }
                const normalizedEmail = email.toLowerCase();
                // check if the user exists with this email 
                const existinguser = await usermodel.findOne({email:normalizedEmail}).select('+password');
                if(!existinguser){
                        return res.status(401).json({
                                message:"no user found with this email"
                        })
                }
                // check the password
                const ismatch = await bcrypt.compare(password,existinguser.password);
                if(!ismatch){
                        return res.status(401).json({
                                message:"invalid password"
                        })
                }
                // generate token for this login 
                const token = JWT.sign({id:existinguser._id},process.env.JWT_SECRET,{expiresIn:'1d'})
                // put the token in the cookie
                res.cookie('token',token,{
                        httpOnly:true // this means that the cookie cannot be accessed by the client side javascript and it will only be sent to the server with every request
                })
                return res.status(200).json({
                        message:"user logged in successfully",
                        user : existinguser,
                        token : token
                })
        }catch(error){
                return res.status(500).json({
                        message:"error loggin in user",
                        error : error.message
                })
        }
}

const logout = async (req,res)=>{
        try{
            res.clearCookie('token',{
                    httpOnly:true
            })
            return res.status(200).json({
                    message:"user logged out successfully"
            })
        }catch(error){
                return res.status(500).json({
                        message:"error logging out user",
                        error : error.message
                })
        }
}

// this is the change password follow for reference
// requestOtp ──── creates ────► OtpTokens collection
//                                       │
// verifyOtp ──── reads & deletes ───────┘
//          └─── creates ────► ResetTokens collection
//                                       │
// changePassword ── reads & deletes ────┘
//                └─ updates ───► Users collection

const  generateOtp = async (req,res) => {
        try{
                let {email} = req.body;
                if(!email){
                        return res.status(400).json({
                                message:"email is required"
                        })
                }
                email = email.toLowerCase();
                // verify if this email exists
                const existinguser = await usermodel.findOne({email:email.toLowerCase()});
                if(!existinguser){
                        return res.status(404).json({
                                message:"no user found with this email"
                        })
                }
                await otpmodel.deleteMany({email:email});
                // generate a 6 digit otp
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                // save the otp in the database
                await otpmodel.create({
                        email:email.toLowerCase(),
                        otp:otp,
                        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // otp will expire in 10 minutes
                })
                // send the otp to the user's email
                await sendOtpEmail(email,otp);
                return res.status(200).json({
                        message:"otp sent to email successfully"
                })
        }catch(error){
                return res.status(500).json({
                        message:"error generating otp",
                        error : error.message
                })
        }
}

const verifyOtp = async (req,res) => {
        try{
                let {email,otp} = req.body;
                email = email.toLowerCase();
                otp = String(otp).trim();
                if(!email||!otp){
                        return res.status(400).json({
                                message:"email and otp both are required"
                        })
                }
                // verify the otp
                const otprecord = await otpmodel.findOne({email:email});
                if(!otprecord){return res.status(400).json({message:"otp not found"})}
                if(String(otprecord.otp).trim() !== otp){return res.status(400).json({message:"invalid otp"})}
                if(Date.now() > otprecord.expiresAt){return res.status(400).json({message:"otp expired"})}
                // if otp is valid then we delete the otp from databse so it cant be used again and we create a resetToken
                await otpmodel.deleteOne({email:email});
                const resetToken = JWT.sign({email:email},process.env.JWT_SECRET,{expiresIn:'15m'});// reset token will expire in 15 minutes
                return res.status(200).json({
                        message:"otp verified successfully",
                        resetToken: resetToken
                })
        }catch(error){
                return res.status(500).json({
                        message:"error verifying otp",
                        error : error.message
                })
        }
}

const changePassword = async (req,res) => {
        try{
                const {newPassword,resetToken} = req.body
                if(!newPassword || !resetToken){
                        return res.status(400).json({
                                message:"new password and reset token both are required"
                        })
                }
                // verify the reset token
                const decoded = JWT.verify(resetToken,process.env.JWT_SECRET)
                const email = decoded.email;
                // find user and update the password 
                const hash = await bcrypt.hash(newPassword,10);
                await usermodel.findOneAndUpdate({email:email},{password:hash})
                return res.status(200).json({
                        message:"password changed successfully"
                })
        }catch(error){
                return res.status(500).json({
                        message:"error changing password",
                        error : error.message
                })
        }
}

module.exports = {
    register,login,logout,changePassword,generateOtp,verifyOtp
}