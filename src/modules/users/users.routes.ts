import { FastifyInstance } from 'fastify'
import { prisma } from '../../config/database'
import { sendSuccess } from '../../utils/apiResponse'
import { authenticate } from '../../middleware/authenticate'

export default async function usersRoutes(app: FastifyInstance) {

  app.get('/students', { preHandler: [authenticate] }, async (request, reply) => {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return sendSuccess(reply, students)
  })

  app.get('/teachers', async (request, reply) => {
    const { subject } = request.query as any
    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
        isActive: true,
        ...(subject ? { teacherProfile: { subject } } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        teacherProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return sendSuccess(reply, teachers)
  })

}