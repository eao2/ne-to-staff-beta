import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { trackingNumber } = body

  if (!trackingNumber) {
    throw createError({
      statusCode: 400,
      message: 'Tracking number is required'
    })
  }

  try {
    const cargo = await prisma.cargoTracking.findUnique({
      where: { trackingNumber },
      include: {
        user: true,
        originLocation: true,
        destinationLocation: true
      }
    })

    if (!cargo) {
      throw createError({
        statusCode: 404,
        message: 'Трак код олдсонгүй!'
      })
    }

    return cargo
  } catch (error) {
    console.error('Error searching cargo:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Алдаа гарлаа, дахин оролдоно уу!'
    })
  }
})
