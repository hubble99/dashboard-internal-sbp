import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient to prevent connection pool exhaustion
const prisma = new PrismaClient();

export default prisma;
