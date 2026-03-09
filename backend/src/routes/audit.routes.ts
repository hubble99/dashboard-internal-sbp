import { Router, Request, Response } from 'express';
import { getAuditLogs, getActionTypes } from '../services/audit.service';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// Audit log bisa diakses oleh SUPER_ADMIN dan ADMIN
// (authMiddleware sudah diterapkan di index.ts untuk semua /api/v1/audit)

router.get('/', async (req: Request, res: Response) => {
    try {
        const filters = {
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
            action: req.query.action as string,
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        };

        const result = await getAuditLogs(filters);
        return sendSuccess(res, result, 'Berhasil mengambil audit logs');
    } catch (error: any) {
        return sendError(res, error.message || 'Gagal mengambil audit logs', 500);
    }
});

router.get('/actions', async (_req: Request, res: Response) => {
    try {
        const actions = await getActionTypes();
        return sendSuccess(res, actions, 'Berhasil mengambil action types');
    } catch (error: any) {
        return sendError(res, error.message || 'Gagal mengambil action types', 500);
    }
});

export default router;
