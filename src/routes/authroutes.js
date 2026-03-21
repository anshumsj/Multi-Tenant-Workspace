const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');

authRouter.post('/register',authController.register)
authRouter.post('/login',authController.login)
authRouter.post('/logout',authController.logout)
authRouter.post('/generateotp',authController.generateOtp)
authRouter.post('/verifyotp',authController.verifyOtp)
authRouter.post('/changepassword',authController.changePassword)
module.exports = authRouter;