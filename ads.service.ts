import { prisma } from '../../config/database'
import { AdPlacement } from '@prisma/client'

export const adsService = {
  // عرض الإعلانات النشطة
  async getActiveAds(placement?: AdPlacement) {
    try {
      return await prisma.ad.findMany({
        where: {
          isActive: true,
          ...(placement ? { placement } : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: {
            select: {
              id: true,
              subject: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      })
    } catch (error) {
      console.error('Error fetching ads:', error)
      throw new Error('فشل في جلب الإعلانات')
    }
  },

  // زيادة عدد المشاهدات
  async incrementViews(adId: string) {
    try {
      return await prisma.ad.update({
        where: { id: adId },
        data: { views: { increment: 1 } },
      })
    } catch (error) {
      console.error('Error incrementing views:', error)
      throw new Error('فشل في تسجيل المشاهدة')
    }
  },

  // زيادة عدد الضغطات
  async incrementClicks(adId: string) {
    try {
      return await prisma.ad.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } },
      })
    } catch (error) {
      console.error('Error incrementing clicks:', error)
      throw new Error('فشل في تسجيل الضغط')
    }
  },

  // إنشاء إعلان — الأدمن فقط
  async createAd(
    adminId: string,
    data: {
      title: string
      imageUrl: string
      placement: AdPlacement
      linkUrl?: string
      targetGrade?: string
      startDate?: Date
      endDate?: Date
    }
  ) {
    try {
      return await prisma.ad.create({
        data: {
          teacherId: adminId,
          title: data.title,
          imageUrl: data.imageUrl,
          placement: data.placement,
          linkUrl: data.linkUrl,
          targetGrade: data.targetGrade,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: true,
          views: 0,
          clicks: 0,
        },
      })
    } catch (error) {
      console.error('Error creating ad:', error)
      throw new Error('فشل في إنشاء الإعلان')
    }
  },

  // جلب كل الإعلانات — الأدمن فقط
  async getAllAds() {
    try {
      return await prisma.ad.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: {
            select: {
              id: true,
              subject: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      })
    } catch (error) {
      console.error('Error fetching all ads:', error)
      throw new Error('فشل في جلب الإعلانات')
    }
  },

  // تعديل إعلان — الأدمن فقط
  async updateAd(
    adminId: string,
    adId: string,
    data: {
      title?: string
      imageUrl?: string
      placement?: AdPlacement
      linkUrl?: string
      targetGrade?: string
      isActive?: boolean
      startDate?: Date
      endDate?: Date
    }
  ) {
    try {
      const ad = await prisma.ad.findUnique({ where: { id: adId } })

      if (!ad) {
        throw new Error('الإعلان غير موجود')
      }

      return await prisma.ad.update({
        where: { id: adId },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
          ...(data.placement !== undefined && { placement: data.placement }),
          ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl }),
          ...(data.targetGrade !== undefined && { targetGrade: data.targetGrade }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.startDate !== undefined && { startDate: data.startDate }),
          ...(data.endDate !== undefined && { endDate: data.endDate }),
        },
      })
    } catch (error: any) {
      console.error('Error updating ad:', error)
      throw new Error(error.message || 'فشل في تعديل الإعلان')
    }
  },

  // حذف إعلان — الأدمن فقط
  async deleteAd(adId: string) {
    try {
      const ad = await prisma.ad.findUnique({ where: { id: adId } })

      if (!ad) {
        throw new Error('الإعلان غير موجود')
      }

      return await prisma.ad.delete({ where: { id: adId } })
    } catch (error: any) {
      console.error('Error deleting ad:', error)
      throw new Error(error.message || 'فشل في حذف الإعلان')
    }
  },
}