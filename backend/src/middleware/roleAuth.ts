import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Middleware: hanya SUPER_ADMIN
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
        }

        const token = authHeader.substring(7);
        const payload = verifyToken(token);

        if (payload.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Super Admin yang dapat mengakses.' });
        }

        (req as any).user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token tidak valid' });
    }
}

// Middleware: SUPER_ADMIN atau ADMIN (semua role yang valid)
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
        }

        const token = authHeader.substring(7);
        const payload = verifyToken(token);

        if (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin yang dapat mengakses.' });
        }

        (req as any).user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token tidak valid' });
    }
}
