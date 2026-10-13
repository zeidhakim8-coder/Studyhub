import { FastifyRequest, FastifyReply } from 'fastify'
import { enrollmentService } from './enrollment.service'
import { sendSuccess, sendError } from '../../utils/apiResponse'

export const enrollmentController = {
  async createPromoCodes(request: FastifyRequest, reply: FastifyReply) {
    const { id: teacherId } = request.user as any
    const { courseId, count, maxUses, expiresAt, prefix } = request.body as any

    if (!courseId || !count) {
      return sendError(reply, 'courseId و count مطلوبين', 422)
    }

    try {
      const codes = await enrollmentService.createPromoCodes({
        courseId,
        teacherId,
        count: Number(count),
        maxUses: maxUses ? Number(maxUses) : 1,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        prefix,
      })
      return sendSuccess(reply, { codes, total: codes.length }, 'تم إنشاء الكودات بنجاح', 201)
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  },

  async enrollWithPromoCode(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = request.user as any
    const { code } = request.body as any

    if (!code) return sendError(reply, 'الكود مطلوب', 422)

    try {
      const enrollment = await enrollmentService.enrollWithPromoCode(userId, code)
      return sendSuccess(reply, enrollment, 'تم الاشتراك بنجاح', 201)
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  },

  async getMyEnrollments(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = request.user as any
    const enrollments = await enrollmentService.getStudentEnrollments(userId)
    return sendSuccess(reply, enrollments)
  },

  async getMyStudents(request: FastifyRequest, reply: FastifyReply) {
    const { id: teacherId } = request.user as any
    const { courseId } = request.query as any
    const students = await enrollmentService.getTeacherStudents(teacherId, courseId)
    return sendSuccess(reply, students)
  },

  async getMyPromoCodes(request: FastifyRequest, reply: FastifyReply) {
    const { id: teacherId } = request.user as any
    const { courseId } = request.query as any
    const codes = await enrollmentService.getTeacherPromoCodes(teacherId, courseId)
    return sendSuccess(reply, codes)
  },
}