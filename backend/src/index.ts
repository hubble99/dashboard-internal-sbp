import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/env';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import refreshRoutes from './routes/refresh.routes';
import filterRoutes from './routes/filter.routes';
import userRoutes from './routes/user.routes';
import auditRoutes from './routes/audit.routes';
import settingsRoutes from './routes/settings.routes';
import profileRoutes from './routes/profile.routes';
import exportRoutes from './routes/export.routes';
import mockApiRoutes from './mock-api';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock API (no auth required - simulates developer API)
app.use('/mock-api', mockApiRoutes);

// Auth routes (no JWT needed)
app.use('/api/v1/auth', authRoutes);

// Protected routes (semua perlu JWT)
app.use('/api/v1/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/v1', authMiddleware, refreshRoutes);
app.use('/api/v1/filters', authMiddleware, filterRoutes);
app.use('/api/v1/users', authMiddleware, userRoutes);
app.use('/api/v1/audit', authMiddleware, auditRoutes);
app.use('/api/v1/settings', authMiddleware, settingsRoutes);
app.use('/api/v1/profile', authMiddleware, profileRoutes);
app.use('/api/v1/export', authMiddleware, exportRoutes);

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📊 Dashboard API: http://localhost:${config.port}/api/v1/dashboard`);
    console.log(`📥 Export API:    http://localhost:${config.port}/api/v1/export`);
    console.log(`🔧 Mock API:      http://localhost:${config.port}/mock-api`);
    console.log(`🏥 Health:        http://localhost:${config.port}/health`);
});

export default app;
