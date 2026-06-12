import { FastifyInstance } from 'fastify'
import { attendanceController } from './attendance.controller'
import { authenticate } from '../../middleware/authenticate'

export default async function attendanceRoutes(app: FastifyInstance) {
  // الطالب يبعت progress كل 30 ثانية
  app.post('/progress', { preHandler: [authenticate] }, attendanceController.updateProgress)

  // الطالب يشوف progress بتاعه في كورس
  app.get('/my-progress/:courseId', { preHandler: [authenticate] }, attendanceController.getMyProgress)

  // المدرس يشوف تقرير الحضور
  app.get('/report/:courseId', { preHandler: [authenticate] }, attendanceController.getCourseReport)
}