import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { sendError } from '../utils/response';

// Extend Express Request to carry user info
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 'Token tidak ditemukan', 401);
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch {
        return sendError(res, 'Token tidak valid atau sudah kedaluwarsa', 401);
    }
}
