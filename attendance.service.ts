import { prisma } from '../../config/database'
import { redis } from '../../config/redis'

export const attendanceService = {
  async updateProgress(data: {
    userId: string
    videoId: string
    watchedSeconds: number
    totalSeconds: number
  }) {
    const percentage =
      data.totalSeconds > 0
        ? Math.min((data.watchedSeconds / data.totalSeconds) * 100, 100)
        : 0

    const attendance = await prisma.videoAttendance.upsert({
      where: {
        userId_videoId: { userId: data.userId, videoId: data.videoId },
      },
      update: {
        watchedSeconds: data.watchedSeconds,
        totalSeconds: data.totalSeconds,
        percentage,
        isCompleted: percentage >= 90,
        lastWatchedAt: new Date(),
      },
      create: {
        userId: data.userId,
        videoId: data.videoId,
        watchedSeconds: data.watchedSeconds,
        totalSeconds: data.totalSeconds,
        percentage,
        isCompleted: percentage >= 90,
      },
    })

    return attendance
  },

  async getCourseAttendanceReport(courseId: string, teacherId: string) {
    const cacheKey = `report:${courseId}`
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const course = await prisma.course.findFirst({
      where: { id: courseId, teacher: { userId: teacherId } },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        sections: {
          include: {
            videos: {
              include: { attendances: true },
            },
          },
        },
      },
    })

    if (!course) throw new Error('الكورس مش موجود')

    const allVideos = course.sections.flatMap((s) => s.videos)
    const totalVideos = allVideos.length

    const report = course.enrollments.map((enrollment) => {
      const studentVideos = allVideos.map((video) => {
        const att = video.attendances.find((a) => a.userId === enrollment.userId)
        return {
          videoId: video.id,
          videoTitle: video.title,
          watchedSeconds: att ? att.watchedSeconds : 0,
          percentage: att ? Math.round(att.percentage) : 0,
          isCompleted: att ? att.isCompleted : false,
        }
      })

      const watchedCount = studentVideos.filter((v) => v.percentage > 10).length
      const completedCount = studentVideos.filter((v) => v.isCompleted).length

      return {
        student: enrollment.user,
        enrolledAt: enrollment.createdAt,
        totalVideos,
        watchedCount,
        completedCount,
        attendancePercentage:
          totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0,
        videos: studentVideos,
      }
    })

    await redis.setex(cacheKey, 300, JSON.stringify(report))
    return report
  },

  async getStudentProgress(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            videos: {
              include: {
                attendances: {
                  where: { userId },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!course) throw new Error('الكورس مش موجود')

    const sections = course.sections.map((section) => ({
      id: section.id,
      title: section.title,
      videos: section.videos.map((video) => {
        const att = video.attendances[0]
        return {
          id: video.id,
          title: video.title,
          duration: video.duration,
          watchedSeconds: att ? att.watchedSeconds : 0,
          percentage: att ? Math.round(att.percentage) : 0,
          isCompleted: att ? att.isCompleted : false,
        }
      }),
    }))

    const allVideos = sections.flatMap((s) => s.videos)
    const totalVideos = allVideos.length
    const completedVideos = allVideos.filter((v) => v.isCompleted).length

    return {
      courseId,
      totalVideos,
      completedVideos,
      overallPercentage:
        totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
      sections,
    }
  },
}