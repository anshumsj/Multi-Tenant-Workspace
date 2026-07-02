import API from './axios';

export const getUserByEmail = async (email) => {
    try {
        const response = await API.post('/user/getUserByEmail', { email });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateProfile = async ({ name, avatarFile }) => {
    const formData = new FormData();
    if (name !== undefined) formData.append('name', name);
    if (avatarFile)         formData.append('avatar', avatarFile);
    const response = await API.patch('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
