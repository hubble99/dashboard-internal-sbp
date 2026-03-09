import { Router, Request, Response } from 'express';
import { changePassword } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/v1/profile — ambil info profil sendiri
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) return sendError(res, 'User tidak ditemukan', 404);
        return sendSuccess(res, user, 'Berhasil mengambil profil');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
});

// PUT /api/v1/profile/password — ganti password sendiri
router.put('/password', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return sendError(res, 'Password lama dan password baru harus diisi', 400);
        }
        const result = await changePassword(userId, oldPassword, newPassword);
        return sendSuccess(res, result, 'Password berhasil diubah');
    } catch (error: any) {
        return sendError(res, error.message || 'Gagal mengubah password', 400);
    }
});

export default router;
