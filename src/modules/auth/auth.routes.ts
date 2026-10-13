import { FastifyInstance } from 'fastify'
import { authController } from './auth.controller'
import { authenticate } from '../../middleware/authenticate'

export default async function authRoutes(app: FastifyInstance) {
  app.post('/register', authController.register)
  app.post('/login', authController.login)
  app.get('/profile', { preHandler: [authenticate] }, authController.profile)
}