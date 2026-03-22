const express = require('express');
const taskRouter = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const workspaceMiddleware = require('../middlewares/workspaceMiddleware');
const projectMiddleware = require('../middlewares/projectMiddleware');

taskRouter.post('/create/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware, taskController.createTask);
taskRouter.get('/getAllTasks/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,projectMiddleware.projectMemberVerificationMiddleware, taskController.getAllTasks);
taskRouter.get('/getSingleTask/:projectId/:taskId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,projectMiddleware.projectMemberVerificationMiddleware,taskController.getSingleTask);

module.exports = taskRouter;
