const express = require('express');
const taskRouter = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const workspaceMiddleware = require('../middlewares/workspaceMiddleware');
const projectMiddleware = require('../middlewares/projectMiddleware');
const upload = require('../middlewares/multer');

taskRouter.post('/create/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware, taskController.createTask);
taskRouter.get('/getAllTasks/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,projectMiddleware.projectMemberVerificationMiddleware, taskController.getAllTasks);
taskRouter.get('/getSingleTask/:projectId/:taskId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,projectMiddleware.projectMemberVerificationMiddleware,taskController.getSingleTask);
taskRouter.patch('/updateTask/:workspaceId/:projectId/:taskId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,taskController.updateTask);
taskRouter.post('/addComment/:workspaceId/:projectId/:taskId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,taskController.addComment);
taskRouter.patch('/addResource/:workspaceId/:projectId/:taskId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,upload.single('file'),taskController.addResource);

// check update task and add comment function


module.exports = taskRouter;
