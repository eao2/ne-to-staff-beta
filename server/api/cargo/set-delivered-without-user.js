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
      where: { trackingNumber }
    })

    if (!cargo) {
      throw createError({
        statusCode: 404,
        message: 'Cargo not found'
      })
    }

    if (cargo.currentStatus !== 'DELIVERED_TO_UB') {
      throw createError({
        statusCode: 400,
        message: 'Cargo must be in DELIVERED_TO_UB status to be delivered'
      })
    }

    const currentTime = new Date().toISOString()

    const updatedCargo = await prisma.cargoTracking.update({
      where: { trackingNumber },
      data: {
        currentStatus: 'DELIVERED',
        deliveredDate: currentTime,
        updatedAt: currentTime
      }
    })

    return updatedCargo
  } catch (error) {
    console.error('Error setting delivered status:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Error updating cargo status'
    })
  }
})