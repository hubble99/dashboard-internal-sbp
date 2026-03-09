import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create super admin user
        const superAdmin = await prisma.user.upsert({
            where: { email: 'admin@example.com' },
            update: {
                password: hashedPassword,
                role: 'SUPER_ADMIN',
            },
            create: {
                email: 'admin@example.com',
                password: hashedPassword,
                name: 'Super Admin',
                role: 'SUPER_ADMIN',
            },
        });

        console.log('✅ Super Admin created/updated:');
        console.log('   Email:', superAdmin.email);
        console.log('   Password: admin123');
        console.log('   Role:', superAdmin.role);

        // Create regular user
        const regularUser = await prisma.user.upsert({
            where: { email: 'user@example.com' },
            update: {
                password: hashedPassword,
                role: 'USER',
            },
            create: {
                email: 'user@example.com',
                password: hashedPassword,
                name: 'Regular User',
                role: 'USER',
            },
        });

        console.log('\n✅ Regular User created/updated:');
        console.log('   Email:', regularUser.email);
        console.log('   Password: admin123');
        console.log('   Role:', regularUser.role);

        console.log('\n🎉 Test users ready! You can now login with either account.');
    } catch (error) {
        console.error('❌ Error creating test users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
