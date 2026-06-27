const express = require('express');
const workspacerouter = express.Router();
const workspaceController = require('../controllers/workspaceController');
const authMiddleware = require('../middlewares/authMiddleware');
const workspaceMiddleware = require('../middlewares/workspaceMiddleware');
const validate = require('../middlewares/validators/validate');
const {
    createWorkspaceValidator,
    addMemberToWorkspaceValidator,
    workspaceParamsValidator
} = require('../middlewares/validators/workspaceValidator');
workspacerouter.post('/create',authMiddleware.tokenVerificationMiddleware, createWorkspaceValidator, validate, workspaceController.createWorkspace)
workspacerouter.post('/:workspaceId/addMember',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,workspaceMiddleware.roleVerificationMiddleware(['owner','admin']) , addMemberToWorkspaceValidator, validate, workspaceController.addMemberToWorkspace)
workspacerouter.get('/getAllWorkspaces',authMiddleware.tokenVerificationMiddleware,workspaceController.getAllWorkspaces)
workspacerouter.get('/getAllMembers/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware, workspaceParamsValidator, validate, workspaceController.getAllMemberOfWorkspace)
workspacerouter.delete('/removeMember/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,workspaceMiddleware.roleVerificationMiddleware(['owner','admin']), workspaceParamsValidator, validate, workspaceController.removeMemberFromWorkspace)

module.exports = workspacerouter;