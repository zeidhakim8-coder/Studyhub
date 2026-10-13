# Study Hub

Backend REST API for an online learning platform where teachers publish video courses and students enrol, watch lessons and track their progress.

## Features

- **Authentication & roles** – JWT login/registration with three roles: `SUPER_ADMIN`, `TEACHER`, `STUDENT`; passwords hashed with bcrypt.
- **Course catalogue** – teacher profiles, courses organised into sections, each holding videos and downloadable files.
- **Enrollment** – students join a course with a promo code; teachers generate and manage promo codes and see their students. The data model also supports paid enrollment (payments table prepared for Paymob).
- **Progress & attendance** – per-video watch tracking with automatic completion at 90%, per-student progress and per-course reports for teachers (cached in Redis).
- **Ads** – placement-based ads with view and click tracking.
- **Admin API** – create teachers, courses, sections and videos, manage coupons and ads, and view platform stats.

## Tech stack

TypeScript · Node.js · Fastify · Prisma ORM · PostgreSQL · Redis · Zod · JWT · bcrypt · Docker Compose

## Getting started

```bash
# 1. Start PostgreSQL and Redis
docker compose -f docker-compose.dev.yml up -d

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env     # then fill in JWT_SECRET and ADMIN_PASSWORD
openssl rand -hex 32     # use the output as JWT_SECRET

# 4. Create the database schema and seed an admin account
npm run db:migrate
npm run db:seed

# 5. Run the API
npm run dev              # http://localhost:5000/health
```

## Project structure

```
prisma/        schema, migrations and seed script
src/
  app.ts       server entry point
  config/      database and Redis clients, env validation
  middleware/  JWT authentication
  modules/     auth, courses, enrollment, attendance, ads, users, admin
  utils/       response helpers, promo-code generator
```

## API overview

| Prefix | Purpose |
| --- | --- |
| `/api/auth` | register, login, profile |
| `/api/courses` | browse courses |
| `/api/enrollment` | enrol with promo code, my courses, promo codes, students |
| `/api/attendance` | update progress, my progress, course report |
| `/api/ads` | list ads, track views and clicks |
| `/api/users` | teachers and students lists |
| `/api/admin` | admin-only management endpoints |

## Roadmap

- Paymob payment flow and webhook
- Bunny video upload and secure playback
- Background workers for notifications and attendance
- Rate limiting and per-role authorization middleware
- Frontend client

## License

MIT
