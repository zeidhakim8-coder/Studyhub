import { FastifyRequest, FastifyReply } from 'fastify'
import { authService } from './auth.service'
import { sendSuccess, sendError } from '../../utils/apiResponse'

export const authController = {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, phone, password } = request.body as any
    if (!name || !email || !password) {
      return sendError(reply, 'name, email, password مطلوبين', 422)
    }
    try {
      const user = await authService.register({ name, email, phone, password })
      const token = await reply.jwtSign({ id: user.id, role: user.role })
      return sendSuccess(reply, { user, token }, 'تم التسجيل بنجاح', 201)
    } catch (err: any) {
      return sendError(reply, err.message)
    }
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { emailOrPhone, password } = request.body as any
    if (!emailOrPhone || !password) {
      return sendError(reply, 'emailOrPhone, password مطلوبين', 422)
    }
    try {
      const user = await authService.login(emailOrPhone, password)
      const token = await reply.jwtSign({ id: user.id, role: user.role })
      return sendSuccess(reply, { user, token }, 'تم الدخول بنجاح')
    } catch (err: any) {
      return sendError(reply, err.message, 401)
    }
  },

  async profile(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.user as { id: string }
    const user = await authService.getProfile(id)
    if (!user) return sendError(reply, 'المستخدم مش موجود', 404)
    return sendSuccess(reply, user)
  },
}