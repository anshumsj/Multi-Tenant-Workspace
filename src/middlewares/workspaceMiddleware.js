const workspaceMemberModel = require('../models/workspaceMember');
const workspaceModel = require('../models/workspace');


const memberVerificationMiddleware = async (req,res,next) => {
    // this middleware will verify if the user belongs to the workspace or not 
    try{
        const userId = req.userId;// user trying to add member
        const workspaceId = req.params.workspaceId;// workspace user is doing action in
        if(!workspaceId){
            return res.status(400).json({
                message:"workspaceId is required in params"
            })
        }
        const workspace = await workspaceModel.findById(workspaceId);
        if(!workspace){
            return res.status(404).json({
                message:"workspace not found"
            })
        }
        const  isMember = await workspaceMemberModel.findOne({
            workspaceId:workspaceId,
            userId:userId
        })
        if(!isMember){
            return res.status(403).json({
                message:"you are not a member of this workspace"
            })
        }
        req.member = isMember;// we will use this in controller to check if the user has 
        // permission to add member or not
        req.workspaceId = workspaceId;
        next();
    }catch(error){
        return res.status(500).json({
            message:"internal server error",
            error: error.message
        })
    }
}

const roleVerificationMiddleware = (allowedRoles) => {
    return (req,res,next) => {
           try{
            const role = req.member.role;
            if(!allowedRoles.includes(role)){
                    return res.status(403).json({
                        message:"you are not authorised to perform this action"
                    })
            }
            next();}catch(error){
                return res.status(500).json({
                    message:"internal server error",
                    error: error.message
                })
            }
    }
}

module.exports = {
    memberVerificationMiddleware,
    roleVerificationMiddleware
};