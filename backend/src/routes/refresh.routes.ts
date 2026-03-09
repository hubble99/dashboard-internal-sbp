import { Router, Request, Response } from 'express';
import { refreshAllData, getLastRefresh } from '../services/refresh.service';
import { logAudit } from '../middleware/auditLog';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.post('/refresh-all', async (req: Request, res: Response) => {
    try {
        const result = await refreshAllData();

        // Log audit dengan detail jumlah record
        if (req.user) {
            await logAudit(
                req.user.userId,
                'REFRESH_ALL',
                undefined,
                JSON.stringify(result)
            );
        }

        return sendSuccess(res, result, 'Data berhasil diperbarui');
    } catch (error: any) {
        console.error('Refresh error:', error);
        return sendError(res, 'Gagal memperbarui data: ' + error.message, 500);
    }
});

router.get('/last-refresh', async (_req: Request, res: Response) => {
    try {
        const lastRefresh = await getLastRefresh();
        return sendSuccess(res, { lastRefresh }, 'OK');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
});

export default router;
