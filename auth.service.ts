import bcrypt from 'bcryptjs'
import { prisma } from '../../config/database'
import { redis } from '../../config/redis'

export const authService = {
  async register(data: {
    name: string
    email: string
    phone?: string
    password: string
  }) {
    const exists = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    })
    if (exists) throw new Error('البريد الإلكتروني أو الهاتف مستخدم بالفعل')

    const passwordHash = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
      },
      select: { id: true, name: true, email: true, role: true },
    })
    return user
  },

  async login(emailOrPhone: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        isActive: true,
      },
    })
    if (!user) throw new Error('بيانات الدخول غلط')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new Error('بيانات الدخول غلط')

    return { id: user.id, name: user.name, email: user.email, role: user.role }
  },

  async getProfile(userId: string) {
    const cacheKey = `user:${userId}`
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        teacherProfile: true,
      },
    })

    if (user) await redis.setex(cacheKey, 300, JSON.stringify(user))
    return user
  },
}