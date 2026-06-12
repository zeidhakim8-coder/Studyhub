import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import authRoutes from './modules/auth/auth.routes'
import enrollmentRoutes from './modules/enrollment/enrollment.routes'
import attendanceRoutes from './modules/attendance/attendance.routes'
import adsRoutes from './modules/ads/ads.routes'
import coursesRoutes from './modules/courses/courses.routes'
import usersRoutes from './modules/users/users.routes'
import adminRoutes from './modules/admin/admin.routes'



// في الـ start function


const app = Fastify({ logger: true })

async function start() {
  try {
    await app.register(adminRoutes, { prefix: '/api/admin' })
    await app.register(helmet, { contentSecurityPolicy: false })
    await app.register(cors, { origin: true, credentials: true })
    await app.register(jwt, { secret: process.env.JWT_SECRET || 'secret_key_change_me' })
    await app.register(authRoutes, { prefix: '/api/auth' })
    await app.register(enrollmentRoutes, { prefix: '/api/enrollment' })
    await app.register(attendanceRoutes, { prefix: '/api/attendance' })
   await app.register(adsRoutes, { prefix: '/api/ads' })
    await app.register(coursesRoutes, { prefix: '/api/courses' })
    await app.register(usersRoutes, { prefix: '/api/users' })

    app.get('/health', async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    }))

    app.setErrorHandler((error: any, request: any, reply: any) => {
      app.log.error(error)
      reply.code(error.statusCode || 500).send({
        success: false,
        message: error.message,
      })
    })

    await app.listen({ port: Number(process.env.PORT) || 5000, host: '0.0.0.0' })
    console.log('🚀 Server running on port 5000')
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

start()