import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logAudit } from '../middleware/auditLog';

const prisma = new PrismaClient();

export async function getAllUsers() {
    return await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function createUser(
    data: { email: string; password: string; name: string; role?: string },
    creatorId: number
) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
        throw new Error('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: data.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN',
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    // Log user creation
    await logAudit(
        creatorId,
        'CREATE_USER',
        undefined,
        JSON.stringify({ createdUserId: user.id, email: user.email, role: user.role })
    );

    return user;
}

export async function updateUser(
    id: number,
    data: { email?: string; name?: string; role?: string },
    updaterId: number
) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error('User tidak ditemukan');
    }

    if (data.email && data.email !== user.email) {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new Error('Email sudah digunakan');
        }
    }

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            ...(data.email && { email: data.email }),
            ...(data.name && { name: data.name }),
            ...(data.role && { role: data.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN' }),
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updatedUser;
}

export async function deleteUser(id: number, deleterId: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error('User tidak ditemukan');
    }

    if (id === deleterId) {
        throw new Error('Tidak dapat menghapus akun sendiri');
    }

    // Prevent deleting the last super admin
    if (user.role === 'SUPER_ADMIN') {
        const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
        if (superAdminCount <= 1) {
            throw new Error('Tidak dapat menghapus super admin terakhir');
        }
    }

    await prisma.user.delete({ where: { id } });

    return { success: true, message: 'User berhasil dihapus' };
}

export async function changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('User tidak ditemukan');
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
        throw new Error('Password lama tidak sesuai');
    }

    if (newPassword.length < 8) {
        throw new Error('Password baru minimal 8 karakter');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return { success: true, message: 'Password berhasil diubah' };
}
