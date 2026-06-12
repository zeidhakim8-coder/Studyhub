import { prisma } from '../../config/database'
import { redis } from '../../config/redis'
import { generatePromoCode } from '../../utils/generatePromoCode'

export const enrollmentService = {
  async createPromoCodes(data: {
    courseId: string
    teacherId: string
    count: number
    maxUses?: number
    expiresAt?: Date
    prefix?: string
  }) {
    const course = await prisma.course.findFirst({
      where: { id: data.courseId, teacher: { userId: data.teacherId } },
    })
    if (!course) throw new Error('الكورس مش موجود أو مش بتاعك')

    const codes = []
    for (let i = 0; i < data.count; i++) {
      const code = await generatePromoCode(data.prefix)
      codes.push({
        code,
        courseId: data.courseId,
        createdById: data.teacherId,
        maxUses: data.maxUses || 1,
        expiresAt: data.expiresAt,
      })
    }

    await prisma.promoCode.createMany({ data: codes })
    return codes.map((c) => c.code)
  },

  async enrollWithPromoCode(userId: string, code: string) {
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { course: true },
    })

    if (!promoCode || !promoCode.isActive)
      throw new Error('الكود غلط أو غير فعال')
    if (promoCode.expiresAt && promoCode.expiresAt < new Date())
      throw new Error('الكود انتهت صلاحيته')
    if (promoCode.currentUses >= promoCode.maxUses)
      throw new Error('الكود اتستخدم قبل كده')

    const alreadyEnrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: promoCode.courseId } },
    })
    if (alreadyEnrolled) throw new Error('أنت مشترك في الكورس ده بالفعل')

    const [enrollment] = await prisma.$transaction([
      prisma.enrollment.create({
        data: {
          userId,
          courseId: promoCode.courseId,
          type: 'PROMO_CODE',
          promoCodeId: promoCode.id,
        },
      }),
      prisma.promoCode.update({
        where: { id: promoCode.id },
        data: { currentUses: { increment: 1 } },
      }),
    ])

    await redis.del(`user:${userId}:enrollments`)
    return enrollment
  },

  async getStudentEnrollments(userId: string) {
    const cacheKey = `user:${userId}:enrollments`
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const enrollments = await prisma.enrollment.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        course: {
          include: {
            teacher: {
              include: { user: { select: { name: true } } },
            },
            sections: {
              include: { videos: true, files: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    })

    await redis.setex(cacheKey, 120, JSON.stringify(enrollments))
    return enrollments
  },

  async getTeacherStudents(teacherId: string, courseId?: string) {
    return prisma.enrollment.findMany({
      where: {
        course: {
          teacher: { userId: teacherId },
          ...(courseId ? { id: courseId } : {}),
        },
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        course: { select: { title: true } },
        promoCode: { select: { code: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getTeacherPromoCodes(teacherId: string, courseId?: string) {
    return prisma.promoCode.findMany({
      where: {
        createdById: teacherId,
        ...(courseId ? { courseId } : {}),
      },
      include: {
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },
}