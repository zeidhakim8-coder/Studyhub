import { FastifyInstance } from 'fastify'
import { prisma } from '../../config/database'
import { sendSuccess } from '../../utils/apiResponse'

export default async function coursesRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        teacher: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return sendSuccess(reply, courses)
  })
}