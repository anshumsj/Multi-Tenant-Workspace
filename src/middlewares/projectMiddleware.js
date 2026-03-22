const projectMemberModel = require('../models/projectmembers');

const projectMemberVerificationMiddleware = async (req,res,next) => {
    try{
        const userId = req.userId;
        const projectId = req.params.projectId;
        const isMember = await projectMemberModel.findOne({
            projectId,userId
        })
        if(!isMember){
            return res.status(403).json({
                success:false,
                message:"you are not a member of this project"
            })
        }
        next();
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error verifying project member",
            error:error.message
        })
    }
}

module.exports = {
    projectMemberVerificationMiddleware}