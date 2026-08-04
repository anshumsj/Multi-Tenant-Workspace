const workspaceModel = require('../models/workspace');
const workspaceMemberModel = require('../models/workspaceMember');
const projectModel = require('../models/projects');
const projectMemberModel = require('../models/projectmembers');
const { canUpdateProject } = require('../permissions/projectPermissions');
const asyncHandler = require('express-async-handler');

const createProject = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const userId = req.userId;
    const {name, description, projectLead} = req.body;
    
    if(!name || !description || name.length < 2 || name.length > 100 || description.length >500){
        return res.status(400).json({
            success:false,
            message:"Invalid input data. Project name must be 2-100 characters and description under 500 characters."
        });
    }
    const newProject = await projectModel.create({
        name,
        description,
        workspaceId,
        createdBy:userId,
        projectLead:projectLead || userId
    });
    
    await projectMemberModel.create({
        projectId:newProject._id,
        userId:projectLead || userId
    });
    
    if (projectLead && projectLead !== userId) {
        await projectMemberModel.create({
            projectId: newProject._id,
            userId: userId
        });
    }
    
    res.status(201).json({
        success:true,
        message:"Project created successfully",
        project:newProject
    });
});

const changeProjectLead = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const projectId = req.params.projectId;
    const {newProjectLead, reason} = req.body;
    
    const isMember = await workspaceMemberModel.findOne({
        workspaceId, userId:newProjectLead
    });
    
    if(!isMember){
        return res.status(400).json({
            success:false,
            message:"The new project lead must be a member of the workspace."
        });
    }
    
    const project = await projectModel.findOne({
        _id:projectId,
        workspaceId
    });
    
    if(!project){
        return res.status(404).json({
            success:false,
            message:"Project not found in the workspace."
        });  
    }
    
    project.projectLead = newProjectLead;
    project.reasonForChangeLead = reason;
    await project.save();
    
    res.status(200).json({
        success:true,
        message:"Project lead changed successfully",
        project
    });
});

const getAllProjects = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const projects = await projectModel.find({workspaceId})
        .populate('projectLead','name email')
        .skip(skip)
        .limit(limit);

    const totalProjects = await projectModel.countDocuments({workspaceId});

    res.status(200).json({
        success:true,
        message:"Projects retrieved successfully",
        projects,
        pagination: {
            total: totalProjects,
            page,
            limit,
            totalPages: Math.ceil(totalProjects / limit)
        }
    });
});

const updateProject = asyncHandler(async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const projectId = req.params.projectId;
    const userId = req.userId;
    const workspacerole = req.member.role;
    
    const project = await projectModel.findOne({_id:projectId, workspaceId});
    if(!project){
        return res.status(404).json({
            success:false,
            message:"Project not found in the workspace."
        });
    }   
    
    if(!canUpdateProject(userId, workspacerole, project.projectLead)){
        return res.status(403).json({
            success:false,
            message:"You are not authorized to update the project."
        });
    }
    
    const {name, description} = req.body;
    if(name){project.name = name;}
    if(description){project.description = description;}
    await project.save();
    
    res.status(200).json({
        success:true,
        message:"Project updated successfully",
        project
    });
});

const deleteProject = asyncHandler(async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const projectId = req.params.projectId;
    const project = await projectModel.findOne({_id:projectId, workspaceId});
    if(!project){
        return res.status(404).json({
            success:false,
            message:"Project not found in the workspace."
        });  
    }
    await projectModel.findByIdAndDelete(projectId);
    res.status(200).json({
        success:true,
        message:"Project deleted successfully"
    });
});

const addMemberToProject = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const projectId = req.params.projectId;
    const workspaceId = req.workspaceId;
    const {newMemberId} = req.body;
    
    const project = await projectModel.findOne({
        _id:projectId,
        workspaceId
    });
    if(!project){
        return res.status(404).json({
            success:false,
            message:"project not found "
        });
    }
    
    if(project.projectLead.toString() !== userId){
        return res.status(403).json({
            success:false,
            message:"Only project lead can add members to the project."
        });
    }
    
    const isMember = await workspaceMemberModel.findOne({
        workspaceId, userId:newMemberId
    });
    
    if(!isMember){
        return res.status(400).json({
            success:false,
            message:"The new member must be a member of the workspace."
        });
    }
    
    const isAlreadyMember = await projectMemberModel.findOne({
        projectId,
        userId:newMemberId
    });
    
    if(isAlreadyMember){
        return res.status(400).json({
            success:false,
            message:"The user is already a member of the project."
        });
    }
    
    const newProjectMember = await projectMemberModel.create({
        projectId,
        userId:newMemberId
    });
    
    return res.status(200).json({
        success:true,
        message:"Member added to the project successfully",
        projectMember:newProjectMember
    });
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const { workspaceId, projectId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const members = await projectMemberModel.find({ projectId })
        .populate('userId', 'name email')
        .skip(skip)
        .limit(limit);

    const totalMembers = await projectMemberModel.countDocuments({ projectId });

    res.status(200).json({ 
        success: true, 
        members,
        pagination: {
            total: totalMembers,
            page,
            limit,
            totalPages: Math.ceil(totalMembers / limit)
        }
    });
});

module.exports = {
    createProject,
    changeProjectLead,
    getAllProjects,
    updateProject,
    deleteProject,
    addMemberToProject,
    getProjectMembers
};
