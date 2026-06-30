import API from './axios';

export const logoutUser = async () => {
    try {
        const response = await API.post('/auth/logout');
        return response.data;
    } catch (error) {
        throw error;
    }
};
