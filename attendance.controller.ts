import { FastifyRequest, FastifyReply } from 'fastify'
import { attendanceService } from './attendance.service'
import { sendSuccess, sendError } from '../../utils/apiResponse'

export const attendanceController = {
  async updateProgress(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = request.user as any
    const { videoId, watchedSeconds, totalSeconds } = request.body as any

    if (!videoId || watchedSeconds === undefined || !totalSeconds) {
      return sendError(reply, 'videoId, watchedSeconds, totalSeconds مطلوبين', 422)
    }

    try {
      const attendance = await attendanceService.updateProgress({
        userId,
        videoId,
        watchedSeconds: Number(watchedSeconds),
        totalSeconds: Number(totalSeconds),
      })
      return sendSuccess(reply, attendance)
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  },

  async getCourseReport(request: FastifyRequest, reply: FastifyReply) {
    const { id: teacherId } = request.user as any
    const { courseId } = request.params as any

    try {
      const report = await attendanceService.getCourseAttendanceReport(courseId, teacherId)
      return sendSuccess(reply, report)
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  },

  async getMyProgress(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = request.user as any
    const { courseId } = request.params as any

    try {
      const progress = await attendanceService.getStudentProgress(userId, courseId)
      return sendSuccess(reply, progress)
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  },
}