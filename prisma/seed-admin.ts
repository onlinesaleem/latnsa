// prisma/seed-admin.ts - Create initial admin users
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUsers() {
  console.log('Creating admin users...')

  try {
    // Admin user
    const adminPassword = await bcrypt.hash('admin123!', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@latnsa.com' },
      update: {},
      create: {
        name: 'System Administrator',
        email: 'admin@latnsa.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    // Clinical staff user
    const clinicalPassword = await bcrypt.hash('clinical123!', 12)
    const clinical = await prisma.user.upsert({
      where: { email: 'clinical@latnsa.com' },
      update: {},
      create: {
        name: 'Dr. Clinical Staff',
        email: 'clinical@latnsa.com',
        passwordHash: clinicalPassword,
        role: 'CLINICAL_STAFF',
        emailVerified: new Date()
      }
    })

    // Demo clinical user
    const demoPassword = await bcrypt.hash('demo123!', 12)
    const demo = await prisma.user.upsert({
      where: { email: 'demo@latnsa.com' },
      update: {},
      create: {
        name: 'Demo Clinical User',
        email: 'demo@latnsa.com',
        passwordHash: demoPassword,
        role: 'CLINICAL_STAFF',
        emailVerified: new Date()
      }
    })

    console.log('✅ Admin users created successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔑 System Admin:')
    console.log('   Email: admin@latnsa.com')
    console.log('   Password: admin123!')
    console.log('')
    console.log('👩‍⚕️ Clinical Staff:')
    console.log('   Email: clinical@latnsa.com')
    console.log('   Password: clinical123!')
    console.log('')
    console.log('🧪 Demo User:')
    console.log('   Email: demo@latnsa.com')
    console.log('   Password: demo123!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  Please change these passwords in production!')

  } catch (error) {
    console.error('Error creating admin users:', error)
    throw error
  }
}

createAdminUsers()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// package.json scripts addition:
/*
Add to your package.json scripts:

"scripts": {
  "db:seed-admin": "tsx prisma/seed-admin.ts",
  "db:seed-questions": "tsx prisma/seed-complete.ts",
  "db:reset": "prisma migrate reset --force && npm run db:seed-admin && npm run db:seed-questions"
}
*/