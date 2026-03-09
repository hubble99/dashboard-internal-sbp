import { Router, Request, Response } from 'express';
import { loginUser } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return sendError(res, 'Email dan password harus diisi', 400);
        }
        // Ambil IP address untuk audit log
        const ipAddress = req.ip || req.socket?.remoteAddress || undefined;
        const result = await loginUser(email, password, ipAddress);
        return sendSuccess(res, result, 'Login berhasil');
    } catch (error: any) {
        return sendError(res, error.message || 'Login gagal', 401);
    }
});

export default router;
