import { prisma } from '../config/database'

export async function generatePromoCode(prefix = ''): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  let exists = true

  while (exists) {
    const random = Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')
    code = prefix ? `${prefix}-${random}` : random
    const found = await prisma.promoCode.findUnique({ where: { code } })
    exists = !!found
  }

  return code
}