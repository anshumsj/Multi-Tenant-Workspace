const workspaceModel = require('../models/workspace');
const workspaceMemberModel = require('../models/workspaceMember');
const projectModel = require('../models/projects');
const projectMemberModel = require('../models/projectmembers');
const { canUpdateProject } = require('../permissions/projectPermissions');

// create project handler
const createProject = async (req,res) => {
    const workspaceId = req.workspaceId;
    const userId = req.userId;
    const {name,description,projectLead} = req.body;
    try{
        if(!name || !description || name.length < 8 || name.length > 100 || description.length >500){
            return res.status(400).json({
                success:false,
                message:"Invalid input data. Please provide valid name and description for the project."
            })
        }
        const newProject = await projectModel.create({
            name,
            description,
            workspaceId,
            createdBy:userId,
            projectLead:projectLead || userId
        })
        await projectMemberModel.create({
            projectId:newProject._id,
            userId:projectLead || userId
        })
        res.status(201).json({
            success:true,
            message:"Project created successfully",
            project:newProject
        })
    }catch(error){
        res.status(500).json({
            success:false,
            message:"Error creating project",
            error:error.message
        })
    }
}

// as we created a project we might need to change the project lead at a point so for that also we need to create a function
const changeProjectLead = async (req,res) => {
        const workspaceId = req.workspaceId;
        // only the owner of the workspace can change the project lead so we need to check the user trying to do this is the owner of the workspace or not // this will be done in the middlewares
        const projectId = req.params.projectId;
        const {newProjectLead,reason} = req.body;
        try{
                // we also need to check if the new project lead is a member of the workspace or not
                const isMember = await workspaceMemberModel.findOne({
                    workspaceId,userId:newProjectLead
                })
                if(!isMember){
                    return res.status(400).json({
                        success:false,
                        message:"The new project lead must be a member of the workspace."
                    })
                }
                const project = await projectModel.findOne({
                        _id:projectId,
                        workspaceId
                })
                if(!project){
                    return res.status(404).json({
                        success:false,
                        message:"Project not found in the workspace."
                    })  
                }
                project.projectLead = newProjectLead;
                project.reasonForChangeLead = reason;
                await project.save();
                res.status(200).json({
                    success:true,
                    message:"Project lead changed successfully",
                    project
                })
        }catch(error){
            res.status(500).json({
                success:false,
                message:"Error changing project lead",
                error:error.message
            })
        }
}
// now we need to create get all projects in a workspace 
const getAllProjects = async (req,res) => {
        // someone who is a member of the workspace can see all the projects in the workspace 
        const workspaceId = req.workspaceId;
        try{
                const projects = await projectModel.find({workspaceId}).populate('projectLead','name email');
                res.status(200).json({
                    success:true,
                    message:"Projects retrieved successfully",
                    projects
                })
        }catch(error){
            res.status(500).json({
                success:false,
                message:"Error retrieving projects",
                error:error.message
            })
        }
}

const updateProject = async (req,res) => {
        try{
                const workspaceId = req.params.workspaceId;
                const projectId = req.params.projectId;
                // we dont need to verify the req body because we can update any field of the project and we will handle the validation in the frontend
                const userId = req.userId;
                const workspacerole = req.member.role;
                const project = await projectModel.findOne({_id:projectId,workspaceId});
                if(!project){
                    return res.status(404).json({
                        success:false,
                        message:"Project not found in the workspace."
                    })  
                }   
                if(!canUpdateProject(userId,workspacerole,project.projectLead)){
                    return res.status(403).json({
                        success:false,
                        message:"You are not authorized to update the project."
                    })
                }
                // if the user is owner or admin of the workspace or project lead then only he can update the project
                // we will update the project with the new data from req body
                const {name,description} = req.body;
                if(name){project.name = name;}
                if(description){project.description = description;}
                await project.save();
                res.status(200).json({
                    success:true,
                    message:"Project updated successfully",
                    project
                })
        }catch(error){
            res.status(500).json({
                success:false,
                message:"Error updating project",
                error:error.message
            })
        }
}

const deleteProject = async (req,res) => {
        try{
                const workspaceId = req.params.workspaceId;
                const projectId = req.params.projectId;
                const project = await projectModel.findOne({_id:projectId,workspaceId});
                if(!project){
                    return res.status(404).json({
                        success:false,
                        message:"Project not found in the workspace."
                    })  
                }
                await project.remove();
                res.status(200).json({
                    success:true,
                    message:"Project deleted successfully"
                })
        }catch(error){
            res.status(500).json({
                success:false,
                message:"Error deleting project",
                error:error.message
            })
        }
}
// only the project lead can add members to the project 
// the user getting added should be a part of the workspace
// check for duplicate entries of members in the project 
const addMemberToProject = async (req,res) => {
        try{
                const userId = req.userId;
                const projectId = req.params.projectId;
                const workspaceId = req.workspaceId;
                const {newMemberId} = req.body;
                const project = await projectModel.findOne({
                    _id:projectId,
                    workspaceId})
                if(!project){
                        return res.status(404).json({
                            success:false,
                            message:"project not found "
                        })
                }
                if(project.projectLead.toString() !== userId){
                        return res.status(403).json({
                            success:false,
                            message:"Only project lead can add members to the project."
                        })
                }
                const isMember = await workspaceMemberModel.findOne({
                    workspaceId,userId:newMemberId
                })
                console.log(isMember)
                if(!isMember){
                    return res.status(400).json({
                        success:false,
                        message:"The new member must be a member of the workspace."
                    })
                }
                // duplicate entry check
                const isAlreadyMember = await projectMemberModel.findOne({
                        projectId,
                        userId:newMemberId
                })
                if(isAlreadyMember){
                    return res.status(400).json({
                        success:false,
                        message:"The user is already a member of the project."
                    })
                }
                const newProjectMember = await projectMemberModel.create({
                        projectId,
                        userId:newMemberId
                })
                return res.status(200).json({
                    success:true,
                    message:"Member added to the project successfully",
                    projectMember:newProjectMember
                })
        }catch(error){
            return res.status(500).json({
                success:false,
                message:"Error adding member to the project",
                error:error.message
            })
        }
}


module.exports = {
    createProject,
    changeProjectLead,
    getAllProjects,
    updateProject,
    deleteProject,
    addMemberToProject
}
