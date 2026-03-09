export const Role = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface User {
    id: number;
    email: string;
    name: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    role?: Role;
}

export interface UpdateUserDto {
    email?: string;
    name?: string;
    role?: Role;
}
