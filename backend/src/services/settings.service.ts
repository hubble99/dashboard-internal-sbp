import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logAudit } from '../middleware/auditLog';

const prisma = new PrismaClient();

export async function changePassword(userId: number, oldPassword: string, newPassword: string) {
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

    // Log password change
    await logAudit(userId, 'CHANGE_PASSWORD');

    return { success: true, message: 'Password berhasil diubah' };
}

export async function updateProfile(userId: number, data: { name?: string; email?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
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
        where: { id: userId },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.email && { email: data.email }),
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        },
    });

    // Log profile update
    await logAudit(userId, 'UPDATE_PROFILE', undefined, JSON.stringify(data));

    return updatedUser;
}

export async function updateThemePreference(userId: number, themeData: any) {
    // Store theme preference in system_meta table with user-specific key
    const key = `user_theme_${userId}`;
    const value = JSON.stringify(themeData);

    await prisma.systemMeta.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });

    return { success: true, message: 'Tema berhasil disimpan' };
}

export async function getThemePreference(userId: number) {
    const key = `user_theme_${userId}`;
    const meta = await prisma.systemMeta.findUnique({ where: { key } });

    if (!meta) {
        return null;
    }

    return JSON.parse(meta.value);
}
