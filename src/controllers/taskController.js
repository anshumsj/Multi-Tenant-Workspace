const taskmodel = require('../models/taskmodel');
const projectmodel = require('../models/projects');
const workspaceMemberModel = require('../models/workspaceMember');
const createTask = async (req,res) => {
    // this controller will create a new task in the workspace
    
    try{
        const workspaceId = req.workspaceId;
        const userId = req.userId;

        const projectId = req.params.projectId;
        // check if the project beongs to the workspace
        const project = await projectmodel.findOne({
            _id:projectId,
            workspaceId:workspaceId});
          if(!project){
            return res.status(404).json({
                success:false,
                message:"Project not found in the workspace."
            })  
          }
          // check if the creator is project lead or not 
          if(project.projectLead.toString() !== userId){
            return res.status(403).json({
                success:false,
                message:"Only project lead can create tasks in the project."
            })  
          }
          
          const {name,description,assignees,deadline}=req.body;
          if(!name||!description||!assignees||!deadline){
            return res.status(400).json({
                success:false,
                message:"Please enter all the fields."
             })
          }
          const invalidAssignees = [];// for future use
          // we need to check if the assignees are real users and are members of this workspace
          const validationResults = await Promise.all(assignees.map(async (assigneeId) => {
              if(await workspaceMemberModel.findOne({
                  workspaceId,userId:assigneeId
              })){
                  return {assigneeId, valid: true};
              }else{
                  invalidAssignees.push(assigneeId);
              }
          }))
          if(invalidAssignees.length>0){
            return res.status(400).json({
                success:false,
                message:"The following assignees are invalid or not members of the workspace.",
                invalidAssignees
            });
          }
          
          const newTask = await taskmodel.create({
              name,
              description,
              assignees,
              deadline,
              projectId,
              workspaceId,
              createdBy:userId
          })
          return res.status(201).json({
              success:true,
              message:"Task created successfully.",
              task:newTask
          })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error.",
            error:error.message
        })
    }
}

const getAllTasks = async (req,res)=>{
        try{
        const workspaceId = req.workspaceId;
                const projectId = req.params.projectId;
        const tasks = await taskmodel
            .find({projectId:projectId, workspaceId: workspaceId})
            .populate('createdBy','name email')
            .populate('assignees','name email')
            .populate('updates.updatedBy','name email')
            .sort({createdAt:-1});
                return res.status(200).json({
                        success:true,
                        message:"Tasks fetched successfully.",
                        tasks:tasks
                })
        }catch(error){
                return res.status(500).json({
                        success:false,
                        message:"Internal server error.",
                        error:error.message
                })
}
}

const getSingleTask = async (req,res) => {
        try{
                const workspaceId = req.workspaceId;
                const {projectId,taskId} = req.params;
                const task = await taskmodel
                    .findOne({_id:taskId,projectId:projectId,workspaceId:workspaceId})
                    .populate('createdBy','name email')
                    .populate('assignees','name email')
                    .populate('updates.updatedBy','name email');
                if(!task){
                    return res.status(404).json({
                        success:false,
                        message:"Task not found in the project."
                    })
                }
                return res.status(200).json({
                    success:true,
                    message:"Task fetched successfully.",
                    task:task
                })   
        }catch(error){
                return res.status(500).json({
                    success:false,
                    message:"Internal server error.",
                    error:error.message
                })
        }
}

const updateTask = async(req,res) => {
        // this controller will update the task details
        
}

module.exports = {
    createTask,
    getAllTasks,
    getSingleTask
}
