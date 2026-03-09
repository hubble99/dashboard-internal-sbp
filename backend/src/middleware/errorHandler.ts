import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { config } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
    console.error('Unhandled error:', err);

    const message = config.nodeEnv === 'production'
        ? 'Terjadi kesalahan internal'
        : err.message;

    sendError(res, message, 500);
}
