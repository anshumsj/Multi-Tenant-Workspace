// Task model:

// name
// description
// projectId — FK to Projects
// workspaceId — FK to Workspaces
// assignees — array of user IDs
// deadline — date
// status — enum: assigned, accepted, in_progress, on_review, completed
// createdBy — user ID
// updates — array of { updatedBy, message, createdAt }
// resources — array of { type, url, name }

const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxLength:50,
        minLength:3
    },
    description:{
        type:String,
        maxLength:500,
    },
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project',
        required:true
    },
    workspaceId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workspace',
        required:true
    },
    assignees:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
      }
    ],
    deadline:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        enum:['assigned','accepted','in_progress','on_review','completed'],
        default:'assigned',
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    comments:[
        {
            commentBy:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                required:true
            },
            comment:{
                type:String,
                maxLength:500
            },
            commentAt:{
                type:Date,
                default:Date.now
            }
        }
    ],
    resources:[
        {
            type:{
                type:String,
                enum:['link','file'],
                required:true
            },
            url:{
                type:String,
                required:true
            },
            name:{
                type:String,
                maxLength:100
            }
        }
    ]
    },{timestamps:true}
)

const task = mongoose.model('Task',taskSchema);
module.exports = task;