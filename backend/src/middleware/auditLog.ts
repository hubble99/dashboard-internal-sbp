import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function auditLog(action: string) {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (req.user) {
                await prisma.auditLog.create({
                    data: {
                        userId: req.user.userId,
                        action,
                        ipAddress: req.ip || req.socket?.remoteAddress || undefined,
                    },
                });
            }
        } catch (error) {
            console.error('Audit log error:', error);
        }
        next();
    };
}

export async function logAudit(
    userId: number | null,
    action: string,
    pageName?: string,
    details?: string,
    ipAddress?: string
) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: userId || undefined,
                action,
                details: details || null,
                ipAddress: ipAddress || null,
            },
        });
    } catch (error) {
        console.error('Audit log error:', error);
    }
}
