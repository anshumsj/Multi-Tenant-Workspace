import axiosInstance from './axios';

export const getAllWorkspaces = async () => {
    const response = await axiosInstance.get('/workspace/getAllWorkspaces');
    return response.data;
};

export const createWorkspace = async (data) => {
    const response = await axiosInstance.post('/workspace/create', data);
    return response.data;
};

export const addMemberToWorkspace = async (workspaceId, data) => {
    const response = await axiosInstance.post(`/workspace/${workspaceId}/addMember`, data);
    return response.data;
};

export const getAllMembersOfWorkspace = async (workspaceId) => {
    const response = await axiosInstance.get(`/workspace/getAllMembers/${workspaceId}`);
    return response.data;
};

export const removeMemberFromWorkspace = async (workspaceId, data) => {
    const response = await axiosInstance.delete(`/workspace/removeMember/${workspaceId}`, { data });
    return response.data;
};
