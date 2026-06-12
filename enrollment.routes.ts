import { FastifyInstance } from 'fastify'
import { enrollmentController } from './enrollment.controller'
import { authenticate } from '../../middleware/authenticate'

export default async function enrollmentRoutes(app: FastifyInstance) {
  // الطالب يشترك بكود
  app.post('/promo', { preHandler: [authenticate] }, enrollmentController.enrollWithPromoCode)

  // الطالب يشوف كورساته
  app.get('/my-courses', { preHandler: [authenticate] }, enrollmentController.getMyEnrollments)

  // المدرس يعمل كودات
  app.post('/promo-codes', { preHandler: [authenticate] }, enrollmentController.createPromoCodes)

  // المدرس يشوف كوداته
  app.get('/promo-codes', { preHandler: [authenticate] }, enrollmentController.getMyPromoCodes)

  // المدرس يشوف طلابه
  app.get('/students', { preHandler: [authenticate] }, enrollmentController.getMyStudents)
}