import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../config/database'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    const payload = request.user as { id: string; role: string }
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, isActive: true },
    })
    if (!user || !user.isActive) {
      return reply.code(401).send({ success: false, message: 'Unauthorized' })
    }
  } catch {
    return reply.code(401).send({ success: false, message: 'Invalid token' })
  }
}