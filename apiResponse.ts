import { FastifyReply } from 'fastify'

export const sendSuccess = (
  reply: FastifyReply,
  data: unknown,
  message = 'success',
  statusCode = 200
) => {
  return reply.code(statusCode).send({
    success: true,
    message,
    data,
  })
}

export const sendError = (
  reply: FastifyReply,
  message: string,
  statusCode = 400,
  errors?: unknown
) => {
  return reply.code(statusCode).send({
    success: false,
    message,
    errors: errors || null,
  })
}