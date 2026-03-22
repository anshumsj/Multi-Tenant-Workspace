const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
})

projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const projectMember = mongoose.model('ProjectMember',projectMemberSchema);
module.exports = projectMember;