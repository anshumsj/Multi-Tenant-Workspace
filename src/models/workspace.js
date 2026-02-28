const mongoose = require('mongoose');
const workspaceSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    description:{
        type:String,
        trim:true
    }
},{timestamps:true})

const Workspace = mongoose.model('Workspace',workspaceSchema);
module.exports = Workspace;