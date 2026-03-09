import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayload {
    userId: number;
    email: string;
    role: string;
}

export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
