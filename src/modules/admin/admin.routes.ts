import { FastifyInstance } from 'fastify'
import { prisma } from '../../config/database'
import { sendSuccess, sendError } from '../../utils/apiResponse'
import { authenticate } from '../../middleware/authenticate'
import bcrypt from 'bcryptjs'

export default async function adminRoutes(app: FastifyInstance) {

  // ============ MIDDLEWARE ============
  const adminOnly = async (request: any, reply: any) => {
    await authenticate(request, reply)
    const user = request.user as any
    if (user.role !== 'SUPER_ADMIN') {
      return reply.code(403).send({ success: false, message: 'ممنوع' })
    }
  }

  // ============ TEACHERS ============

  // إضافة مدرس جديد
  app.post('/teachers', { preHandler: [adminOnly] }, async (request, reply) => {
    const { name, email, password, phone, subject, bio, price } = request.body as any
    try {
      const exists = await prisma.user.findUnique({ where: { email } })
      if (exists) return sendError(reply, 'الإيميل ده موجود بالفعل')

      const passwordHash = await bcrypt.hash(password, 12)
      const user = await prisma.user.create({
        data: {
          name, email, phone, passwordHash,
          role: 'TEACHER',
          teacherProfile: {
            create: { subject, bio, price: price || 0, isPublished: true }
          }
        },
        include: { teacherProfile: true }
      })
      return sendSuccess(reply, user, 'تم إضافة المدرس', 201)
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // تعديل مدرس
  app.patch('/teachers/:id', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    const { name, phone, subject, bio, price, isPublished, isActive } = request.body as any
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(isActive !== undefined && { isActive }),
          ...(subject || bio || price !== undefined || isPublished !== undefined ? {
            teacherProfile: {
              update: {
                ...(subject && { subject }),
                ...(bio && { bio }),
                ...(price !== undefined && { price }),
                ...(isPublished !== undefined && { isPublished }),
              }
            }
          } : {})
        },
        include: { teacherProfile: true }
      })
      return sendSuccess(reply, user, 'تم التعديل')
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // حذف مدرس
  app.delete('/teachers/:id', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    try {
      await prisma.user.delete({ where: { id } })
      return sendSuccess(reply, null, 'تم الحذف')
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // ============ STUDENTS ============

  // تعديل طالب
  app.patch('/students/:id', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    const { name, phone, isActive } = request.body as any
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(isActive !== undefined && { isActive }),
        }
      })
      return sendSuccess(reply, user, 'تم التعديل')
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // حذف طالب
  app.delete('/students/:id', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    try {
      await prisma.user.delete({ where: { id } })
      return sendSuccess(reply, null, 'تم الحذف')
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // ============ COURSES ============

  // إنشاء كورس
  app.post('/courses', { preHandler: [adminOnly] }, async (request, reply) => {
    const { teacherId, title, description, grade, subject, thumbnail } = request.body as any
    try {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId: teacherId } })
      if (!teacher) return sendError(reply, 'المدرس مش موجود')

      const course = await prisma.course.create({
        data: { teacherId: teacher.id, title, description, grade, subject, thumbnail, isPublished: true }
      })
      return sendSuccess(reply, course, 'تم إنشاء الكورس', 201)
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // تعديل كورس
  app.patch('/courses/:id', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    const data = request.body as any
    try {
      const course = await prisma.course.update({ where: { id }, data })
      return sendSuccess(reply, course, 'تم التعديل')
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // حذف كورس
  app.delete('/courses/:id', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    try {
      await prisma.course.delete({ where: { id } })
      return sendSuccess(reply, null, 'تم الحذف')
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // إضافة section لكورس
  app.post('/courses/:id/sections', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    const { title, sortOrder } = request.body as any
    try {
      const section = await prisma.section.create({
        data: { courseId: id, title, sortOrder: sortOrder || 0 }
      })
      return sendSuccess(reply, section, 'تم إضافة الوحدة', 201)
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // ============ VIDEOS ============

  // إضافة فيديو
  app.post('/videos', { preHandler: [adminOnly] }, async (request, reply) => {
    const { sectionId, title, description, bunnyVideoId, duration, isFreePreview, sortOrder } = request.body as any
    try {
      const video = await prisma.video.create({
        data: {
          sectionId, title, description,
          bunnyVideoId: bunnyVideoId || `temp-${Date.now()}`,
          duration: duration || 0,
          isPublished: true,
          isFreePreview: isFreePreview || false,
          sortOrder: sortOrder || 0
        }
      })
      return sendSuccess(reply, video, 'تم إضافة الفيديو', 201)
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // تعديل فيديو
  app.patch('/videos/:id', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    const data = request.body as any
    try {
      const video = await prisma.video.update({ where: { id }, data })
      return sendSuccess(reply, video, 'تم التعديل')
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // حذف فيديو
  app.delete('/videos/:id', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    try {
      await prisma.video.delete({ where: { id } })
      return sendSuccess(reply, null, 'تم الحذف')
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // ============ COUPONS ============

  // إلغاء كوبون
  app.patch('/coupons/:id/deactivate', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    try {
      const code = await prisma.promoCode.update({
        where: { id }, data: { isActive: false }
      })
      return sendSuccess(reply, code, 'تم إلغاء الكوبون')
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // كل الكوبونات
  app.get('/coupons', { preHandler: [adminOnly] }, async (request, reply) => {
    const { courseId } = request.query as any
    const coupons = await prisma.promoCode.findMany({
      where: courseId ? { courseId } : {},
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return sendSuccess(reply, coupons)
  })

  // ============ ADS ============

  // إنشاء إعلان
  app.post('/ads', { preHandler: [adminOnly] }, async (request, reply) => {
    const { teacherId, title, imageUrl, linkUrl, placement, targetGrade, priority, startDate, endDate } = request.body as any
    try {
      const teacher = await prisma.teacherProfile.findFirst({
        where: { userId: teacherId }
      })
      if (!teacher) return sendError(reply, 'المدرس مش موجود')

      const ad = await prisma.ad.create({
        data: {
          teacherId: teacher.id, title, imageUrl, linkUrl,
          placement: placement || 'SIDEBAR',
          targetGrade, priority: priority || 0,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        }
      })
      return sendSuccess(reply, ad, 'تم إنشاء الإعلان', 201)
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // كل الإعلانات
  app.get('/ads', { preHandler: [adminOnly] }, async (request, reply) => {
    const ads = await prisma.ad.findMany({
      include: { teacher: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' }
    })
    return sendSuccess(reply, ads)
  })

  // تعديل إعلان
  app.patch('/ads/:id', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    const data = request.body as any
    try {
      const ad = await prisma.ad.update({ where: { id }, data })
      return sendSuccess(reply, ad, 'تم التعديل')
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // حذف إعلان
  app.delete('/ads/:id', { preHandler: [adminOnly] }, async (request, reply) => {
    const { id } = request.params as any
    try {
      await prisma.ad.delete({ where: { id } })
      return sendSuccess(reply, null, 'تم الحذف')
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  })

  // ============ STATS ============
  app.get('/stats', { preHandler: [adminOnly] }, async (request, reply) => {
    const [students, teachers, courses, coupons, ads] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.course.count(),
      prisma.promoCode.count({ where: { isActive: true } }),
      prisma.ad.count({ where: { isActive: true } }),
    ])
    return sendSuccess(reply, { students, teachers, courses, coupons, ads })
  })

  // make-teacher (existing)
  app.post('/make-teacher', { preHandler: [adminOnly] }, async (request, reply) => {
    const { userId, subject, bio, price } = request.body as any
    await prisma.user.update({ where: { id: userId }, data: { role: 'TEACHER' } })
    const profile = await prisma.teacherProfile.upsert({
      where: { userId },
      update: { subject, bio, price: price || 0, isPublished: true },
      create: { userId, subject, bio, price: price || 0, isPublished: true },
    })
    return sendSuccess(reply, profile, 'تم تحويل المستخدم لمدرس')
  })
}