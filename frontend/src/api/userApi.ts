import api from './client';
import type { User, CreateUserDto, UpdateUserDto } from '../types/user.types';

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data.data;
};

export const createUser = async (data: CreateUserDto): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data.data;
};

export const updateUser = async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
};

export const deleteUser = async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
};
