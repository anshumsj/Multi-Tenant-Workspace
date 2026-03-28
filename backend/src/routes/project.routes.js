const express = require('express');
const projectRouter = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');
const workspaceMiddleware = require('../middlewares/workspaceMiddleware');


projectRouter.post('/create/:workspaceId',authMiddleware.tokenVerificationMiddleware,
  workspaceMiddleware.memberVerificationMiddleware,workspaceMiddleware.roleVerificationMiddleware(['owner','admin']),projectController.createProject)

projectRouter.get('/getAllProjects/:workspaceId',authMiddleware.tokenVerificationMiddleware,
  workspaceMiddleware.memberVerificationMiddleware,projectController.getAllProjects)

projectRouter.patch('/update/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,
  workspaceMiddleware.memberVerificationMiddleware,projectController.updateProject)

projectRouter.delete('/delete/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,
  workspaceMiddleware.memberVerificationMiddleware,workspaceMiddleware.roleVerificationMiddleware(['owner','admin']),projectController.deleteProject)
  
projectRouter.patch('/changelead/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,workspaceMiddleware.roleVerificationMiddleware(['owner']),projectController.changeProjectLead) 
projectRouter.post('/addMember/:projectId/:workspaceId',authMiddleware.tokenVerificationMiddleware,workspaceMiddleware.memberVerificationMiddleware,projectController.addMemberToProject)    

module.exports = projectRouter;
