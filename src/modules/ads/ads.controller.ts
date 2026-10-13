import { FastifyRequest, FastifyReply } from 'fastify'
import { adsService } from './ads.service'
import { AdPlacement } from '@prisma/client'

export const adsController = {
  async getAds(request: FastifyRequest, reply: FastifyReply) {
    const { placement } = request.query as { placement?: AdPlacement }
    const ads = await adsService.getActiveAds(placement)
    return reply.send({ success: true, data: ads })
  },

  async trackView(request: FastifyRequest, reply: FastifyReply) {
    const { adId } = request.params as { adId: string }
    await adsService.incrementViews(adId)
    return reply.send({ success: true })
  },

  async trackClick(request: FastifyRequest, reply: FastifyReply) {
    const { adId } = request.params as { adId: string }
    await adsService.incrementClicks(adId)
    return reply.send({ success: true })
  },

  // الأدمن فقط
  async createAd(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user

    if (user.role !== 'SUPER_ADMIN') {
      return reply.code(403).send({
        success: false,
        message: 'غير مصرح لك، الأدمن فقط',
      })
    }

    const body = request.body as {
      title: string
      imageUrl: string
      placement: AdPlacement
      linkUrl?: string
      targetGrade?: string
      startDate?: Date
      endDate?: Date
    }

    const ad = await adsService.createAd(user.id, body)
    return reply.code(201).send({ success: true, data: ad })
  },

  // الأدمن فقط
  async getAllAds(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user

    if (user.role !== 'SUPER_ADMIN') {
      return reply.code(403).send({
        success: false,
        message: 'غير مصرح لك، الأدمن فقط',
      })
    }

    const ads = await adsService.getAllAds()
    return reply.send({ success: true, data: ads })
  },

  // الأدمن فقط
  async updateAd(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user

    if (user.role !== 'SUPER_ADMIN') {
      return reply.code(403).send({
        success: false,
        message: 'غير مصرح لك، الأدمن فقط',
      })
    }

    const { adId } = request.params as { adId: string }
    const body = request.body as {
      title?: string
      imageUrl?: string
      placement?: AdPlacement
      linkUrl?: string
      targetGrade?: string
      isActive?: boolean
      startDate?: Date
      endDate?: Date
    }

    const ad = await adsService.updateAd(user.id, adId, body)
    return reply.send({ success: true, data: ad })
  },

  // الأدمن فقط
  async deleteAd(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user

    if (user.role !== 'SUPER_ADMIN') {
      return reply.code(403).send({
        success: false,
        message: 'غير مصرح لك، الأدمن فقط',
      })
    }

    const { adId } = request.params as { adId: string }
    await adsService.deleteAd(adId)
    return reply.send({ success: true, message: 'تم حذف الإعلان' })
  },
}