import { FastifyInstance } from 'fastify'
import { adsController } from './ads.controller'
import { authenticate } from '../../middleware/authenticate'

export default async function adsRoutes(app: FastifyInstance) {
  // عام — أي حد يشوف الإعلانات
  app.get('/', adsController.getAds)
  app.post('/:adId/view', adsController.trackView)
  app.post('/:adId/click', adsController.trackClick)

  // الأدمن فقط
  app.post('/', { preHandler: [authenticate] }, adsController.createAd)
  app.get('/all', { preHandler: [authenticate] }, adsController.getAllAds)
  app.patch('/:adId', { preHandler: [authenticate] }, adsController.updateAd)
  app.delete('/:adId', { preHandler: [authenticate] }, adsController.deleteAd)
}