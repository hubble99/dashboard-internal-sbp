import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'admin@bapanas.go.id' },
        update: { role: 'SUPER_ADMIN' },
        create: {
            email: 'admin@bapanas.go.id',
            password: hashedPassword,
            name: 'Admin BAPANAS',
            role: 'SUPER_ADMIN',
        },
    });
    console.log(`✅ User created: ${user.email}`);

    // Initialize system meta
    await prisma.systemMeta.upsert({
        where: { key: 'last_refresh' },
        update: {},
        create: { key: 'last_refresh', value: 'Belum pernah di-refresh' },
    });
    console.log('✅ System metadata initialized');

    console.log('🎉 Seeding complete!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Login with: admin@bapanas.go.id / password123');
    console.log('   3. Hit POST /api/v1/refresh-all to load dummy data');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
