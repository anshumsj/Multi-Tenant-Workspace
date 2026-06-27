const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validators/validate');
const { authLimiter, otpLimiter } = require('../middlewares/rateLimiter');
const { 
    registerValidator, 
    loginValidator, 
    emailValidator, 
    verifyOtpValidator, 
    changePasswordValidator 
} = require('../middlewares/validators/authValidator');

authRouter.post('/register', authLimiter, registerValidator, validate, authController.register);
authRouter.post('/login', authLimiter, loginValidator, validate, authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/generateotp', otpLimiter, emailValidator, validate, authController.generateOtp);
authRouter.post('/verifyotp', verifyOtpValidator, validate, authController.verifyOtp);
authRouter.post('/changepassword', changePasswordValidator, validate, authController.changePassword);
module.exports = authRouter;