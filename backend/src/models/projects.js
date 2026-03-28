const mongoose = require('mongoose');
// project model will include 
//1. project name 
//2. project description
//3. workspace id to which project belongs 
//4. created by 
//5. created at(date and time)
//6. updated at(date and time)
// also one worksapce can not have two projects with same name 
// project will have a project lead by default the user who created the project will be the lead 

const projectSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:8,
        maxLength:100,
    },
    description:{
        type:String,
        maxLength:500,
    },
    workspaceId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workspace',
        required:true,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    projectLead:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    reasonForChangeLead:{
        type:String,
        maxLength:500,
    }
},{timestamps:true})

projectSchema.index({name:1,workspaceId:1},{unique:true})// this will ensure that no two projects with same name can be created in same workspace

const Projects = mongoose.model('Project',projectSchema);
module.exports = Projects;
