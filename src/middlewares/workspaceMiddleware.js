const workspaceMemberModel = require('../models/workspaceMember');
const workspaceModel = require('../models/workspace');


const workspaceVerificationMiddleware = async (req,res,next) => {
    // this middleware will verify if the user belongs to the workspace or not and also verify the role of the user in the workspace
    try{
        const userId = req.userId;// user trying to add member
        const workspaceId = req.params.workspaceId;// workspace user is doing action in
        const  isMember = await workspaceMemberModel.findOne({
            workspaceId:workspaceId,
            userId:userId
        })
        if(!isMember){
            return res.status(403).json({
                message:"you are not a member of this w orkspace so you can not add members to this workspace"
            })
        }
        req.member = isMember;// we will use this in controller to check if the user has permission to add member or not
        next();
    }catch(error){
        return res.status(500).json({
            message:"internal server error"
        })
    }
}

module.exports = {
    workspaceVerificationMiddleware
};