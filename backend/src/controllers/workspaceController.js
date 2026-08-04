const Workspacemodel = require('../models/workspace');
const WorkspaceMembermodel = require('../models/workspaceMember');
const usermodel = require('../models/usermodel');
const Projects = require('../models/projects');
const projectMember = require('../models/projectmembers');
const Task = require('../models/taskmodel');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

const createWorkspace = asyncHandler(async (req, res) => {
    console.log('\n🚀 === CONTROLLER CALLED ===');
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userId = req.userId;
    
        const {name, description} = req.body;
        if(!name){
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message:"please enter workspace name"
            });
        }
        
        const workspace = await Workspacemodel.create([{
            name, description, owner:userId
        }], { session });
        
        const workspaceOwner = await WorkspaceMembermodel.create([{
            workspaceId:workspace[0]._id,
            userId:userId,
            role:'owner',
        }], { session });
        
        await session.commitTransaction();
        session.endSession();
        
        res.status(201).json({
            message:"workspace created successfully",
            workspace: workspace[0],
            workspaceOwner: workspaceOwner[0]
        });
    } catch(error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

const addMemberToWorkspace = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const userId = req.userId;
    const member = req.member;
    
    const {newUserId, role} = req.body;
    if(!newUserId || !role){
        return res.status(400).json({
            message:"please enter newUserId and role both"
        });
    }
    
    if(role === 'owner'){
        return res.status(400).json({
            message:"you can not assign owner role to any user"
        });
    }
    const existinguser = await usermodel.findById(newUserId);
    if(!existinguser){
        return res.status(404).json({
            message:"the user you are trying to add does not exist"
        });
    }
    
    const existingMember = await WorkspaceMembermodel.findOne({
        workspaceId:workspaceId,
        userId:newUserId
    });
    if(existingMember){
        return res.status(400).json({
            message:"this user is already a member of this workspace"
        });
    }
    const newMember = await WorkspaceMembermodel.create({
        workspaceId:workspaceId,
        userId:newUserId,
        role:role
    });
    
    const populatedMember = await newMember.populate('userId', 'name email');
    
    return res.status(201).json({
        message:"member added successfully to workspace",
        member: populatedMember
    });
});

const getAllWorkspaces = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const workspaceMembers = await WorkspaceMembermodel.find({userId:userId}).populate('workspaceId');
    if(workspaceMembers.length === 0){
        return res.status(200).json({
                message:'you are not a member of any workspace',
                workspaces: []
        });
    }
    const workspaces = workspaceMembers.map(member => member.workspaceId);
    return res.status(200).json({
            message:'workspaces fetched successfully',
            workspaces: workspaces
    });
});

const getAllMemberOfWorkspace = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const members = await WorkspaceMembermodel.find({workspaceId:workspaceId})
        .populate('userId','name email')
        .select('role userId')
        .skip(skip)
        .limit(limit);

    const totalMembers = await WorkspaceMembermodel.countDocuments({workspaceId:workspaceId});

    if(members.length === 0 && page === 1){
        return res.status(200).json({
                message:'no members found in this workspace',
                members: [],
                pagination: { total: 0, page, limit, totalPages: 0 }
        });
    }
    return res.status(200).json({
            message:'members fetched successfully',
            members: members,
            pagination: {
                total: totalMembers,
                page,
                limit,
                totalPages: Math.ceil(totalMembers / limit)
            }
    });
});

const removeMemberFromWorkspace = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const {memberId} = req.body;
    if(!memberId){
        return res.status(400).json({
                message:'please provide memberId'
        });
    }
    
    const result = await WorkspaceMembermodel.findByIdAndDelete(memberId);
    if(!result){
        return res.status(404).json({
                message:'member not found'
        });
    }
    
    return res.status(200).json({
            message:'member removed successfully',
            member: result
    });
});

const deleteWorkspace = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const userId = req.userId;

    // Only the workspace owner may delete the entire workspace
    const membership = req.member;
    if (membership.role !== 'owner') {
        return res.status(403).json({
            message: 'only the workspace owner can delete this workspace'
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // 1. Collect all project IDs that belong to this workspace
        const projects = await Projects.find({ workspaceId }, '_id').session(session);
        const projectIds = projects.map(p => p._id);

        // 2. Delete all tasks in this workspace
        await Task.deleteMany({ workspaceId }, { session });

        // 3. Delete all project-members for every project in this workspace
        if (projectIds.length > 0) {
            await projectMember.deleteMany({ projectId: { $in: projectIds } }, { session });
        }

        // 4. Delete all projects in this workspace
        await Projects.deleteMany({ workspaceId }, { session });

        // 5. Delete all workspace members (including the owner row)
        await WorkspaceMembermodel.deleteMany({ workspaceId }, { session });

        // 6. Delete the workspace document itself
        await Workspacemodel.findByIdAndDelete(workspaceId, { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: 'workspace and all associated data deleted successfully'
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

const updateWorkspace = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const { name, description } = req.body;

    if (name === undefined && description === undefined) {
        return res.status(400).json({
            message: 'provide at least one field to update: name or description'
        });
    }

    const updates = {};
    if (name !== undefined)      updates.name        = name;
    if (description !== undefined) updates.description = description;

    const updated = await Workspacemodel.findByIdAndUpdate(
        workspaceId,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!updated) {
        return res.status(404).json({ message: 'workspace not found' });
    }

    return res.status(200).json({
        message: 'workspace updated successfully',
        workspace: updated
    });
});

module.exports = {
    createWorkspace,
    addMemberToWorkspace,
    getAllWorkspaces,
    getAllMemberOfWorkspace,
    removeMemberFromWorkspace,
    deleteWorkspace,
    updateWorkspace
};
