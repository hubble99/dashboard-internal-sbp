import prisma from '../lib/prisma';

interface AuditFilters {
    startDate?: string;
    endDate?: string;
    userId?: number;
    action?: string;
    page?: number;
    limit?: number;
}

export async function getAuditLogs(filters: AuditFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) {
            where.timestamp.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            // Tambahkan 1 hari agar endDate bersifat inklusif (sampai akhir hari)
            const end = new Date(filters.endDate);
            end.setDate(end.getDate() + 1);
            where.timestamp.lt = end;
        }
    }

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: { id: true, email: true, name: true, role: true },
                },
            },
            orderBy: { timestamp: 'desc' },
            skip,
            take: limit,
        }),
        prisma.auditLog.count({ where }),
    ]);

    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getActionTypes() {
    const actions = await prisma.auditLog.findMany({
        select: { action: true },
        distinct: ['action'],
        orderBy: { action: 'asc' },
    });
    return actions.map(a => a.action);
}
