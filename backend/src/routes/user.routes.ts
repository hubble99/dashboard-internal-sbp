import { Router, Request, Response } from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/user.service';
import { requireSuperAdmin } from '../middleware/roleAuth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// Semua route user management hanya untuk SUPER_ADMIN
router.use(requireSuperAdmin);

router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        return sendSuccess(res, users, 'Berhasil mengambil data user');
    } catch (error: any) {
        return sendError(res, error.message || 'Gagal mengambil data user', 500);
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name) {
            return sendError(res, 'Email, password, dan nama harus diisi', 400);
        }
        const creatorId = (req as any).user.userId;
        const user = await createUser({ email, password, name, role }, creatorId);
        return sendSuccess(res, user, 'User berhasil dibuat');
    } catch (error: any) {
        return sendError(res, error.message || 'Gagal membuat user', 400);
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        const { email, name, role } = req.body;
        const updaterId = (req as any).user.userId;
        const user = await updateUser(id, { email, name, role }, updaterId);
        return sendSuccess(res, user, 'User berhasil diupdate');
    } catch (error: any) {
        return sendError(res, error.message || 'Gagal mengupdate user', 400);
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        const deleterId = (req as any).user.userId;
        const result = await deleteUser(id, deleterId);
        return sendSuccess(res, result, 'User berhasil dihapus');
    } catch (error: any) {
        return sendError(res, error.message || 'Gagal menghapus user', 400);
    }
});

export default router;
