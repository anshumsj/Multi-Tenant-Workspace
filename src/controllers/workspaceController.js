// Backend must:
// Verify user is authenticated
// Validate input
// Create workspace
// Create WorkspaceMember with role OWNER
// Return clean response
// Atomic operation mindset.
const Workspacemodel = require('../models/workspace');
const WorkspaceMembermodel = require('../models/workspaceMember');
const usermodel = require('../models/usermodel');
const mongoose = require('mongoose');
const WorkspaceMember = require('../models/workspaceMember');

const createWorkspace = async (req,res) => {
    console.log('\n🚀 === CONTROLLER CALLED ===');
    // first the user trying to create the workspace verify his token and get his user id from the token for this we will create auth middleware 
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const userId = req.userId;
        // console.log('User ID:', userId);
        // console.log('Content-Type:', req.headers['content-type']);
        // console.log('Request Body:', req.body);
        // console.log('Body is undefined?', req.body === undefined);
        // console.log('Body is object?', typeof req.body);
        // now we will validate the req body
    
        const {name,description} = req.body;
        if(!name){
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message:"please enter workspace name"
            })
        }
        // now we will create workspace 
        const workspace = await Workspacemodel.create([{
            name,description,owner:userId
        }], { session });
        // now we will create workspace member with role owner 
        const workspaceOwner = await WorkspaceMembermodel.create([{
            workspaceId:workspace[0]._id,
            userId:userId,
            role:'owner',
        }], { session })
        
        await session.commitTransaction();
        session.endSession();
        
        res.status(201).json({
            message:"workspace created successfully",
            workspace: workspace[0],
            workspaceOwner: workspaceOwner[0]
        })
    }catch(error){
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            message:"error creating workspace",
            error : error.message
        })
    }
}


// 1️⃣ Verify authentication
// 2️⃣ Verify requester belongs to workspace
// 3️⃣ Verify requester role is OWNER or ADMIN
// 4️⃣ Validate new user exists
// 5️⃣ Prevent duplicate membership
// 6️⃣ Create WorkspaceMember
// 7️⃣ Return clean response

const addMemberToWorkspace = async (req,res) => {
    try{
        const workspaceId = req.params.workspaceId;
        const userId = req.userId;
        const member = req.member;// we will get this from workspaceVerificationMiddleware which we will create in workspace middleware
        // we will check if the user has permission to add member or not in workspaceVerificationMiddleware and we will pass the role of the user in req.member and we will check that role here if the role is viewer or member then we will return error because only owner and admin can add members to workspace
        if(member.role === 'viewer' || member.role === 'member'){
            return res.status(403).json({
                message:"you are not authorised to add members to this workspace"
            })
        }
        const {newUserId,role} = req.body;
        if(!newUserId || !role){
            return res.status(400).json({
                message:"please enter newUserId and role both"
            })
        }
        // also no one can assign owner role to anyone else only owner can create workspace and he will be the only owner of that workspace so we will check if the role is owner or not if it is owner then we will return error
        if(role === 'owner'){
            return res.status(400).json({
                message:"you can not assign owner role to any user"
            })
        }
        const existinguser = await usermodel.findById(newUserId);
        if(!existinguser){
            return res.status(404).json({
                message:"the user you are trying to add does not exist"
            })
        }
        // we need to check if the user is already a member of the workspace or not
        const existingMember = await WorkspaceMembermodel.findOne({
            workspaceId:workspaceId,
            userId:newUserId
        })
        if(existingMember){
            return res.status(400).json({
                message:"this user is already a member of this workspace"
            })
        }
        const newMember = await WorkspaceMembermodel.create({
            workspaceId:workspaceId,
            userId:newUserId,
            role:role
        })
        
        return res.status(201).json({
            message:"member added successfully to workspace",
            member: newMember
        })
    }catch(error){
        return res.status(500).json({
            message:"error adding member to workspace",
            error: error.message
        })
    }
}

const getAllWorkspaces = async (req,res) => {
        try{
                userId = req.userId;
                const workspaces = await WorkspaceMembermodel.find({userId:userId}).populate('workspaceId','name description');
                if(workspaces.length === 0){
                    return res.status(404).json({
                            message:'you are not a member of any workspace'
                    })
                }
                return res.status(200).json({
                        message:'workspaces fetched successfully',
                        workspaces: workspaces
                })
}               catch(error){                
                        return res.status(500).json({
                        message:"error fetching workspaces",
                        error: error.message
                })
        }
}

const getAllMemberOfWorkspace = async (req,res) => {
        const workspaceId = req.params.workspaceId;
        try{
                const members = await WorkspaceMembermodel.findOne({workspaceId:workspaceId}).populate('userId','name email').select('role userId');
                if(!members.length === 0){
                    return res.status(404).json({
                            message:'no members found in this workspace'
                    })
                }
                return res.status(200).json({
                        message:'members fetched successfully',
                        members: members
                })
        }catch(error){
                return res.status(500).json({
                        message:"error fetching members of workspace",
                        error: error.message
                })
        }
}

module.exports = {
    createWorkspace,
    addMemberToWorkspace,
    getAllWorkspaces,
    getAllMemberOfWorkspace
}

