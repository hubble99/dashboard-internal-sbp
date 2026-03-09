import { Router, Request, Response } from 'express';
import { changePassword, updateProfile, updateThemePreference, getThemePreference } from '../services/settings.service';
import { authMiddleware as authenticate } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/change-password', async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return sendError(res, 'Password lama dan baru harus diisi', 400);
        }
        const userId = (req as any).user.userId;
        const result = await changePassword(userId, oldPassword, newPassword);
        return sendSuccess(res, result, 'Password berhasil diubah');
    } catch (error: any) {
        return sendError(res, error.message || 'Gagal mengubah password', 400);
    }
});

router.put('/profile', async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;
        if (!name && !email) {
            return sendError(res, 'Nama atau email harus diisi', 400);
        }
        const userId = (req as any).user.userId;
        const user = await updateProfile(userId, { name, email });
        return sendSuccess(res, user, 'Profil berhasil diupdate');
    } catch (error: any) {
        return sendError(res, error.message || 'Gagal mengupdate profil', 400);
    }
});

router.put('/theme', async (req: Request, res: Response) => {
    try {
        const themeData = req.body;
        const userId = (req as any).user.userId;
        const result = await updateThemePreference(userId, themeData);
        return sendSuccess(res, result, 'Tema berhasil disimpan');
    } catch (error: any) {
        return sendError(res, error.message || 'Gagal menyimpan tema', 500);
    }
});

router.get('/theme', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const theme = await getThemePreference(userId);
        return sendSuccess(res, theme, 'Berhasil mengambil tema');
    } catch (error: any) {
        return sendError(res, error.message || 'Gagal mengambil tema', 500);
    }
});

export default router;
