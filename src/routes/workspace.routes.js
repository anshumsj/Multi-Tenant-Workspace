const express = require('express');
const workspacerouter = express.Router();
const workspaceController = require('../controllers/workspaceController');
const authMiddleware = require('../middlewares/authMiddleware');
const workspaceMiddleware = require('../middlewares/workspaceMiddleware');

workspacerouter.post('/create',authMiddleware.tokenVerificationMiddleware,workspaceController.createWorkspace)
workspacerouter.post('/:workspaceId/addMember',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.workspaceVerificationMiddleware,workspaceController.addMemberToWorkspace)
workspacerouter.get('/getAllWorkspaces',authMiddleware.tokenVerificationMiddleware,workspaceController.getAllWorkspaces)
workspacerouter.get('/getAllMembers/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.workspaceVerificationMiddleware,workspaceController.getAllMemberOfWorkspace)

module.exports = workspacerouter;