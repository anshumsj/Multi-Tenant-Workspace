const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();
const validate = require('../middlewares/validators/validate');
const { getUserByEmailValidator } = require('../middlewares/validators/userValidator');
const { tokenVerificationMiddleware } = require('../middlewares/authMiddleware');

userRouter.post('/getUserByEmail', tokenVerificationMiddleware, getUserByEmailValidator, validate, userController.getUserByEmail);

module.exports = userRouter;