
const tokenBlacklist = require('../models/tokenBlacklist');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const tokenVerificationMiddleware = async (req,res,next) => {
  console.log("\n🔐 AUTH MIDDLEWARE CALLED");
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];// either we will get the token from the cookie or from the authorization header
    if(!token){
        return res.status(401).json({
            message:"no token -> you are not authorised for this req"
        })
    }
    // now if token exists check if it is a blacklisted token or not 
    const blacklistedToken = await tokenBlacklist.findOne({token:token});
    if(blacklistedToken){
        return res.status(401).json({
            message:"token is blacklisted -> you are not authorised for this req"
        })
    }
    // now we will verify the token and get the user id from the token and attach it to the req object for further use in the controllers
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({
            message:"invalid token -> you are not authorised for this req"
        })
    }
}

module.exports = {tokenVerificationMiddleware};