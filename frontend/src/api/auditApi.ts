import api from './client';

export interface AuditLog {
    id: number;
    userId: number | null;          // nullable: LOGIN_FAILED bisa tanpa userId
    action: string;
    details: string | null;
    ipAddress: string | null;
    timestamp: string;
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
    } | null;                       // nullable: user bisa null jika LOGIN_FAILED
}

export interface AuditFilters {
    startDate?: string;
    endDate?: string;
    userId?: number;
    action?: string;
    page?: number;
    limit?: number;
}

export interface AuditResponse {
    logs: AuditLog[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const getAuditLogs = async (filters: AuditFilters): Promise<AuditResponse> => {
    const response = await api.get('/audit', { params: filters });
    return response.data.data;
};

export const getActionTypes = async (): Promise<string[]> => {
    const response = await api.get('/audit/actions');
    return response.data.data;
};
