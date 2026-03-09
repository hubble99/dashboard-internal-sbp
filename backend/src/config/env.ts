import dotenv from 'dotenv';
dotenv.config();

const rawCorsOrigins = process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3001';

export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    mockApiBaseUrl: process.env.MOCK_API_BASE_URL || 'http://localhost:3000/mock-api',
    // CORS: comma-separated list of allowed origins
    // Production example: "https://dashboard.bapanas.go.id"
    // Development default: "http://localhost:5173,http://localhost:3001"
    corsOrigins: rawCorsOrigins.split(',').map(o => o.trim()),
};
