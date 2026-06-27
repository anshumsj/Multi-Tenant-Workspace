const express = require('express');
const taskRouter = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const workspaceMiddleware = require('../middlewares/workspaceMiddleware');
const projectMiddleware = require('../middlewares/projectMiddleware');
const upload = require('../middlewares/multer');
const validate = require('../middlewares/validators/validate');
const {
    createTaskValidator,
    updateTaskValidator,
    addCommentValidator,
    taskParamsValidator,
    projectTaskParamsValidator
} = require('../middlewares/validators/taskValidator');
taskRouter.post('/create/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware, createTaskValidator, validate, taskController.createTask);
taskRouter.get('/getAllTasks/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,projectMiddleware.projectMemberVerificationMiddleware, projectTaskParamsValidator, validate, taskController.getAllTasks);
taskRouter.get('/getSingleTask/:projectId/:taskId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,projectMiddleware.projectMemberVerificationMiddleware, taskParamsValidator, validate, taskController.getSingleTask);
taskRouter.patch('/updateTask/:workspaceId/:projectId/:taskId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware, updateTaskValidator, validate, taskController.updateTask);
taskRouter.post('/addComment/:workspaceId/:projectId/:taskId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware, addCommentValidator, validate, taskController.addComment);
taskRouter.patch('/addResource/:workspaceId/:projectId/:taskId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,upload.single('file'), taskParamsValidator, validate, taskController.addResource);
taskRouter.delete('/deleteTask/:workspaceId/:projectId/:taskId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware, taskParamsValidator, validate, taskController.deleteTask);

// check update task and add comment function


module.exports = taskRouter;
