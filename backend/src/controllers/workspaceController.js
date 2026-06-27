const Workspacemodel = require('../models/workspace');
const WorkspaceMembermodel = require('../models/workspaceMember');
const usermodel = require('../models/usermodel');
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
        return res.status(404).json({
                message:'you are not a member of any workspace'
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
    const members = await WorkspaceMembermodel.find({workspaceId:workspaceId}).populate('userId','name email').select('role userId');
    if(members.length === 0){
        return res.status(404).json({
                message:'no members found in this workspace'
        });
    }
    return res.status(200).json({
            message:'members fetched successfully',
            members: members
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

module.exports = {
    createWorkspace,
    addMemberToWorkspace,
    getAllWorkspaces,
    getAllMemberOfWorkspace,
    removeMemberFromWorkspace
};
