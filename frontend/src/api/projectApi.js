import axiosInstance from './axios';

export const getAllProjects = async (workspaceId) => {
    const response = await axiosInstance.get(`/project/getAllProjects/${workspaceId}`);
    return response.data;
};

export const createProject = async (workspaceId, data) => {
    const response = await axiosInstance.post(`/project/create/${workspaceId}`, data);
    return response.data;
};

export const updateProject = async (projectId, workspaceId, data) => {
    const response = await axiosInstance.patch(`/project/update/${projectId}/${workspaceId}`, data);
    return response.data;
};

export const deleteProject = async (projectId, workspaceId) => {
    const response = await axiosInstance.delete(`/project/delete/${projectId}/${workspaceId}`);
    return response.data;
};

export const changeProjectLead = async (projectId, workspaceId, data) => {
    const response = await axiosInstance.patch(`/project/changelead/${projectId}/${workspaceId}`, data);
    return response.data;
};

export const addMemberToProject = async (projectId, workspaceId, data) => {
    const response = await axiosInstance.post(`/project/addMember/${projectId}/${workspaceId}`, data);
    return response.data;
};
