const usermodel = require('../models/usermodel');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
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
module.exports = {
    register,login,logout
}