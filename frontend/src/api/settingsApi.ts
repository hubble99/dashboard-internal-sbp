import api from './client';

export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}

export interface UpdateProfileDto {
    name?: string;
    email?: string;
}

export const changePassword = async (data: ChangePasswordDto): Promise<void> => {
    await api.post('/settings/change-password', data);
};

export const updateProfile = async (data: UpdateProfileDto): Promise<any> => {
    const response = await api.put('/settings/profile', data);
    return response.data.data;
};

export const saveThemePreference = async (themeData: any): Promise<void> => {
    await api.put('/settings/theme', themeData);
};

export const getThemePreference = async (): Promise<any> => {
    const response = await api.get('/settings/theme');
    return response.data.data;
};
