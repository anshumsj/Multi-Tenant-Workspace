const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();

userRouter.post('/getUserByEmail',userController.getUserByEmail);

module.exports = userRouter;