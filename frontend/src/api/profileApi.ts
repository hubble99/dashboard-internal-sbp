import api from './client';

export const getProfile = async () => {
    const response = await api.get('/profile');
    return response.data.data;
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
    const response = await api.put('/profile/password', { oldPassword, newPassword });
    return response.data;
};
