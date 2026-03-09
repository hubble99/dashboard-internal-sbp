# ─── Stage 1: Build Frontend ──────────────────────────────────────────────────
FROM node:20-slim AS frontend-builder
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build
# Hasil build ada di /frontend/dist

# ─── Stage 2: Build Backend ───────────────────────────────────────────────────
FROM node:20-slim AS backend-builder
WORKDIR /app

# Install dependencies
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci

# Copy source dan build TypeScript
COPY backend/ ./
RUN npm run build

# Generate Prisma Client
RUN npx prisma generate

# ─── Stage 3: Production Image ────────────────────────────────────────────────
FROM node:20-slim AS production
WORKDIR /app

# Install hanya production dependencies
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci --omit=dev
RUN npx prisma generate

# Copy compiled backend
COPY --from=backend-builder /app/dist ./dist

# Copy frontend build ke folder public (akan di-serve oleh Express)
COPY --from=frontend-builder /frontend/dist ./public

# Environment defaults (override via docker run -e atau docker-compose)
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Jalankan migrasi + seed lalu start server
CMD sh -c "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"
