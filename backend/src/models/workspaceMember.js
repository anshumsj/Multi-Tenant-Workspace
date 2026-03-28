const mongoose = require('mongoose');
const workspaceMemberSchema = new mongoose.Schema({
    workspaceId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workspace',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    role:{
        type:String,
        enum:['admin','member','owner','viewer'],
        default:'member'
    }
    }
,{timestamps:true})
workspaceMemberSchema.index({workspaceId:1,userId:1},{unique:true})
workspaceMemberSchema.index({workspaceId:1,role:1},{unique:true,partialFilterExpressionL: {role:'owner'}})
const WorkspaceMember = mongoose.model('WorkspaceMember',workspaceMemberSchema);
module.exports = WorkspaceMember;