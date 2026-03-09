import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt';
import { logAudit } from '../middleware/auditLog';

const prisma = new PrismaClient();

export async function loginUser(email: string, password: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Log failed login — userId null karena user tidak ditemukan
        await logAudit(null, 'LOGIN_FAILED', undefined, JSON.stringify({ attemptedEmail: email }), ipAddress);
        throw new Error('Email atau password salah');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        // Log failed login — userId null karena password salah
        await logAudit(null, 'LOGIN_FAILED', undefined, JSON.stringify({ attemptedEmail: email }), ipAddress);
        throw new Error('Email atau password salah');
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    // Log successful login
    await logAudit(user.id, 'LOGIN', undefined, undefined, ipAddress);

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    };
}
