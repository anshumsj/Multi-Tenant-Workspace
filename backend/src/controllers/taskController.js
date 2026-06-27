const taskmodel = require('../models/taskmodel');
const projectmodel = require('../models/projects');
const workspaceMemberModel = require('../models/workspaceMember');
const projectMemberModel = require('../models/projectmembers');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');

const createTask = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const userId = req.userId;
    const projectId = req.params.projectId;

    const project = await projectmodel.findOne({
        _id:projectId,
        workspaceId:workspaceId
    });
    
    if(!project){
        return res.status(404).json({
            success:false,
            message:"Project not found in the workspace."
        });
    }
    
    if(project.projectLead.toString() !== userId){
        return res.status(403).json({
            success:false,
            message:"Only project lead can create tasks in the project."
        });
    }
      
    const {name, description, assignees, deadline} = req.body;
    if(!name || !description || !assignees || !deadline){
        return res.status(400).json({
            success:false,
            message:"Please enter all the fields."
        });
    }
    
    const invalidAssignees = [];
    const validationResults = await Promise.all(assignees.map(async (assigneeId) => {
        if(await projectMemberModel.findOne({
            projectId:projectId, userId:assigneeId
        })){
            return {assigneeId, valid: true};
        }else{
            invalidAssignees.push(assigneeId);
        }
    }));
    
    if(invalidAssignees.length > 0){
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
    });
    
    return res.status(201).json({
        success:true,
        message:"Task created successfully.",
        task:newTask
    });
});

const getAllTasks = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const projectId = req.params.projectId;
    const tasks = await taskmodel
        .find({projectId:projectId, workspaceId: workspaceId})
        .populate('createdBy','name email')
        .populate('assignees','name email')
        .populate('comments.commentBy','name email')
        .sort({createdAt:-1});
        
    return res.status(200).json({
        success:true,
        message:"Tasks fetched successfully.",
        tasks:tasks
    });
});

const getSingleTask = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const {projectId, taskId} = req.params;
    const task = await taskmodel
        .findOne({_id:taskId, projectId:projectId, workspaceId:workspaceId})
        .populate('createdBy','name email')
        .populate('assignees','name email')
        .populate('comments.commentBy','name email');
        
    if(!task){
        return res.status(404).json({
            success:false,
            message:"Task not found in the project."
        });
    }
    
    return res.status(200).json({
        success:true,
        message:"Task fetched successfully.",
        task:task
    });   
});

const updateTask = asyncHandler(async(req, res) => {
    const workspaceId = req.workspaceId;
    const userId = req.userId;
    const projectId = req.params.projectId;
    const taskId = req.params.taskId;
    
    const project = await projectmodel.findOne({
        _id:projectId,
        workspaceId:workspaceId
    });
    if(!project){
        return res.status(404).json({
            success:false,
            message:"Project not found in the workspace."
        });  
    }
    
    if(project.projectLead.toString() !== userId){
        return res.status(403).json({
                success:false,
                message:"only project leads are allowed to edit the task details"
        });
    }
    
    const task = await taskmodel.findOne({_id:taskId, projectId:projectId, workspaceId:workspaceId});
    if(!task){
        return res.status(404).json({
            success:false,
            message:"Task not found in the project."
        });
    }
    
    const {name, description, assignees, deadline, status} = req.body;
    if(name){task.name = name;}
    if(description){task.description = description;}
    if(deadline){task.deadline = deadline;}
    if(status){task.status = status;}
    
    if(assignees && assignees.length > 0){
        const newAssignees = await Promise.all(assignees.map(assigneeId =>{
            return (projectMemberModel.findOne({projectId:projectId,userId:assigneeId})).then(member => ({assigneeId,member}));
        }));
        
        const validAssignees = newAssignees.filter(assignee=>assignee.member!==null).map(assignee => assignee.assigneeId);
        const invalidAssignees = newAssignees.filter(assignee=>assignee.member === null).map(assignee=>assignee.assigneeId);
        
        if(invalidAssignees.length > 0){
            return res.status(400).json({
                success:false,
                message:"The following assignees are invalid or not members of the project.",
                invalidAssignees
            });
        }
        task.assignees = validAssignees;
    }
    
    await task.save();
    return res.status(200).json({
        success:true,
        message:"Task updated successfully.",
        task:task
    });
});

const addComment = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const userId = req.userId;
    const projectId = req.params.projectId;
    const taskId = req.params.taskId;
    
    const project = await projectmodel.findOne({
        _id:projectId,
        workspaceId:workspaceId
    });
    
    if(!project){
        return res.status(404).json({
            success:false,
            message:"Project not found in the workspace."
        });
    }
    
    const task = await taskmodel.findOne({
        _id:taskId,
        projectId:projectId,
        workspaceId:workspaceId
    });
    
    if(!task){
        return res.status(404).json({
            success:false,
            message:"Task not found in the project."
        });
    }
    
    if(!task.assignees.some(assigneeId => assigneeId.toString() === userId)){
        return res.status(403).json({
            success:false,
            message:"Only task assignees can comment on the task."
        });
    }
    
    const {comment} = req.body;
    if(!comment){
        return res.status(400).json({
            success:false,
            message:"Please enter a comment."
        });
    }
    
    task.comments.push({
        commentBy:userId,
        comment:comment,
        commentAt:Date.now()
    });

    await task.save();
    return res.status(200).json({
        success:true,
        message:"Comment added successfully.",
    });
});

const addResource = asyncHandler(async (req, res) => {
    const workspaceId = req.workspaceId;
    const userId = req.userId;
    const projectId = req.params.projectId;
    const taskId = req.params.taskId;

    const task = await taskmodel.findOne({ _id: taskId, projectId, workspaceId });
    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found." });
    }

    if (!task.assignees.some(assigneeId => assigneeId.toString() === userId)) {
        return res.status(403).json({ success: false, message: "Only task assignees can add resources." });
    }

    const { type, name, url } = req.body;

    if (type === "link") {
        if (!url || !name) {
            return res.status(400).json({ success: false, message: "URL and name are required for links." });
        }
        task.resources.push({ type: "link", url, name });
    }

    if (type === "file") {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto", 
                    folder: "task-resources",
                    public_id: req.file.originalname.split('.')[0],
                    use_filename: true,
                    unique_filename: false,
                    format: req.file.originalname.split('.').pop()
                },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(result);
                }
            ).end(req.file.buffer);
        });

        task.resources.push({
            type: "file",
            url: uploadResult.secure_url,
            name: req.file.originalname
        });
    }

    await task.save();
    return res.status(200).json({ success: true, message: "Resource added successfully.", task });
});

const deleteTask = asyncHandler(async (req, res) => {
    const { workspaceId, projectId, taskId } = req.params;
    const userId = req.userId;
    
    const project = await projectmodel.findOne({ _id: projectId, workspaceId });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    
    if (project.projectLead.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Only project lead can delete tasks" });
    }
    
    const task = await taskmodel.findOneAndDelete({ _id: taskId, projectId, workspaceId });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    
    return res.status(200).json({ success: true, message: "Task deleted successfully" });
});

module.exports = {
    createTask,
    getAllTasks,
    getSingleTask,
    updateTask,
    addComment,
    addResource,
    deleteTask
};
