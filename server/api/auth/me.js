import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await prisma.staffUser.findUnique({
    where: { id: event.context.auth.userId },
    select: {
      id: true,
      name: true,
      email: true,
      division: {
        select: {
          name: true
        }
      }
    }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'User not found'
    })
  }

  return user
})
