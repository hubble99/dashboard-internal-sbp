import { Response } from 'express';

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, statusCode = 500, data: any = null) {
    const response: ApiResponse = {
        success: false,
        message,
        data,
    };
    return res.status(statusCode).json(response);
}
