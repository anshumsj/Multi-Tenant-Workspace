const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();
const validate = require('../middlewares/validators/validate');
const { getUserByEmailValidator } = require('../middlewares/validators/userValidator');

userRouter.post('/getUserByEmail', getUserByEmailValidator, validate, userController.getUserByEmail);

module.exports = userRouter;