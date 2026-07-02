const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();
const validate = require('../middlewares/validators/validate');
const { getUserByEmailValidator, updateProfileValidator } = require('../middlewares/validators/userValidator');
const { tokenVerificationMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');

userRouter.post('/getUserByEmail', tokenVerificationMiddleware, getUserByEmailValidator, validate, userController.getUserByEmail);
userRouter.patch('/profile', tokenVerificationMiddleware, upload.single('avatar'), updateProfileValidator, validate, userController.updateProfile);

module.exports = userRouter;