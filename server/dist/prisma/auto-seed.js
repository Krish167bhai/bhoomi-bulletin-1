"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoSeedIfEmpty = autoSeedIfEmpty;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
/**
 * Auto-seeds the database with default admin and sample users
 * ONLY if no admin user exists yet. Safe to call on every startup.
 */
async function autoSeedIfEmpty() {
    try {
        const adminExists = await prisma.user.findUnique({
            where: { email: 'admin@bhoomibulletin.com' },
        });
        if (adminExists) {
            console.log('✅ Database already seeded — skipping auto-seed.');
            return;
        }
        console.log('🌱 First run detected — auto-seeding database...');
        const adminPassword = await bcryptjs_1.default.hash('Admin@123456', 12);
        const userPassword = await bcryptjs_1.default.hash('User@123456', 12);
        // Create admin
        await prisma.user.create({
            data: {
                name: 'Bhoomi Bulletin Chief Editor',
                email: 'admin@bhoomibulletin.com',
                phone: '9811000001',
                passwordHash: adminPassword,
                role: 'ADMIN',
                userType: 'OWNER',
                isEmailVerified: true,
                isPhoneVerified: true,
                verificationStatus: 'VERIFIED',
                bio: 'Head of editorial and listings verification at Bhoomi Bulletin.',
                companyName: 'Bhoomi Bulletin Media Network',
            },
        });
        // Create broker
        await prisma.user.create({
            data: {
                name: 'Rajesh Sharma',
                email: 'rajesh.broker@bhoomibulletin.com',
                phone: '9811000002',
                passwordHash: userPassword,
                role: 'BROKER',
                userType: 'BROKER',
                isEmailVerified: true,
                isPhoneVerified: true,
                verificationStatus: 'VERIFIED',
                companyName: 'Sharma Realty',
            },
        });
        // Create regular user
        await prisma.user.create({
            data: {
                name: 'Vikram Singh',
                email: 'vikram.singh@gmail.com',
                phone: '9811000003',
                passwordHash: userPassword,
                role: 'USER',
                userType: 'OWNER',
                isEmailVerified: true,
                isPhoneVerified: false,
                verificationStatus: 'NONE',
            },
        });
        // Create default site settings
        const defaultSettings = [
            { key: 'site_name', value: 'Bhoomi Bulletin' },
            { key: 'site_tagline', value: 'Your Trusted Real Estate Media Partner' },
            { key: 'contact_email', value: 'contact@bhoomibulletin.com' },
            { key: 'contact_phone', value: '+91 98110 00001' },
            { key: 'contact_address', value: 'New Delhi, India' },
        ];
        for (const setting of defaultSettings) {
            await prisma.siteSetting.upsert({
                where: { key: setting.key },
                update: {},
                create: setting,
            });
        }
        console.log('✅ Auto-seed complete! Default admin and users created.');
        console.log('   Admin: admin@bhoomibulletin.com / Admin@123456');
        console.log('   Broker: rajesh.broker@bhoomibulletin.com / User@123456');
        console.log('   User: vikram.singh@gmail.com / User@123456');
    }
    catch (err) {
        console.error('⚠️ Auto-seed encountered an error (non-fatal):', err);
    }
    finally {
        await prisma.$disconnect();
    }
}
