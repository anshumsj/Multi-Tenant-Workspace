import API from './axios';

export const getUserByEmail = async (email) => {
    try {
        const response = await API.post('/user/getUserByEmail', { email });
        return response.data;
    } catch (error) {
        throw error;
    }
};
