import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edu.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@edu.com',
      passwordHash: adminPassword,
      role: Role.SUPER_ADMIN,
    },
  })

  const teacherPassword = await bcrypt.hash('Teacher123!', 12)
  const teacher = await prisma.user.upsert({
    where: { email: 'arabic@edu.com' },
    update: {},
    create: {
      name: 'أستاذ محمد - عربي',
      email: 'arabic@edu.com',
      passwordHash: teacherPassword,
      role: Role.TEACHER,
      teacherProfile: {
        create: {
          subject: 'اللغة العربية',
          bio: 'مدرس لغة عربية خبرة 10 سنين',
          price: 500,
          promoPrice: 0,
          isPublished: true,
        },
      },
    },
  })

  console.log('✅ Seed complete!')
  console.log('Admin:', admin.email, '/ Admin123!')
  console.log('Teacher:', teacher.email, '/ Teacher123!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())