import axiosInstance from './axios';

export const getAllTasks = async (projectId, workspaceId, page = 1, limit = 20) => {
    const response = await axiosInstance.get(`/task/getAllTasks/${projectId}/${workspaceId}`, { params: { page, limit } });
    return response.data;
};

export const getSingleTask = async (projectId, taskId, workspaceId) => {
    const response = await axiosInstance.get(`/task/getSingleTask/${projectId}/${taskId}/${workspaceId}`);
    return response.data;
};

export const createTask = async (projectId, workspaceId, data) => {
    const response = await axiosInstance.post(`/task/create/${projectId}/${workspaceId}`, data);
    return response.data;
};

export const updateTask = async (workspaceId, projectId, taskId, data) => {
    const response = await axiosInstance.patch(`/task/updateTask/${workspaceId}/${projectId}/${taskId}`, data);
    return response.data;
};

export const updateTaskStatus = async (workspaceId, projectId, taskId, status) => {
    const response = await axiosInstance.patch(`/task/updateTaskStatus/${workspaceId}/${projectId}/${taskId}`, { status });
    return response.data;
};

export const addComment = async (workspaceId, projectId, taskId, data) => {
    const response = await axiosInstance.post(`/task/addComment/${workspaceId}/${projectId}/${taskId}`, data);
    return response.data;
};

export const addResource = async (workspaceId, projectId, taskId, formData) => {
    // Do NOT manually set Content-Type here.
    // Axios auto-detects FormData and sets: 'multipart/form-data; boundary=XXXXXX'
    // Manually setting it strips the boundary, breaking multer's file parsing.
    const response = await axiosInstance.patch(`/task/addResource/${workspaceId}/${projectId}/${taskId}`, formData);
    return response.data;
};

export const deleteTask = async (workspaceId, projectId, taskId) => {
    const response = await axiosInstance.delete(`/task/deleteTask/${workspaceId}/${projectId}/${taskId}`);
    return response.data;
};

export const deleteResource = async (workspaceId, projectId, taskId, resourceId) => {
    const response = await axiosInstance.delete(`/task/deleteResource/${workspaceId}/${projectId}/${taskId}/${resourceId}`);
    return response.data;
};
