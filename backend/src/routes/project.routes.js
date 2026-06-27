const express = require('express');
const projectRouter = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');
const workspaceMiddleware = require('../middlewares/workspaceMiddleware');
const validate = require('../middlewares/validators/validate');
const {
    createProjectValidator,
    updateProjectValidator,
    changeProjectLeadValidator,
    addMemberToProjectValidator,
    projectParamsValidator
} = require('../middlewares/validators/projectValidator');

projectRouter.post('/create/:workspaceId',authMiddleware.tokenVerificationMiddleware,
  workspaceMiddleware.memberVerificationMiddleware,workspaceMiddleware.roleVerificationMiddleware(['owner','admin']),createProjectValidator, validate, projectController.createProject)

projectRouter.get('/getAllProjects/:workspaceId',authMiddleware.tokenVerificationMiddleware,
  workspaceMiddleware.memberVerificationMiddleware,projectController.getAllProjects)

projectRouter.patch('/update/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,
  workspaceMiddleware.memberVerificationMiddleware,updateProjectValidator, validate, projectController.updateProject)

projectRouter.delete('/delete/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,
  workspaceMiddleware.memberVerificationMiddleware,workspaceMiddleware.roleVerificationMiddleware(['owner','admin']),projectParamsValidator, validate, projectController.deleteProject)
  
projectRouter.patch('/changelead/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,workspaceMiddleware.roleVerificationMiddleware(['owner']),changeProjectLeadValidator, validate, projectController.changeProjectLead) 
projectRouter.post('/addMember/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,addMemberToProjectValidator, validate, projectController.addMemberToProject)    
projectRouter.get('/getMembers/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,projectParamsValidator, validate, projectController.getProjectMembers)

module.exports = projectRouter;
