import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  try {
    const cargos = await prisma.cargoTracking.findMany({
      where: {
        userId: null,
        currentStatus: 'DELIVERED_TO_UB',
        destinationLocationId: process.env.DIVISION_LOCATION_ID
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        trackingNumber: true,
        cargoType: true,
        price: true,
        currentStatus: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return { cargos }
  } catch (error) {
    console.error('Error fetching unassigned cargos:', error)
    throw createError({
      statusCode: 500,
      message: 'Error fetching unassigned cargos'
    })
  }
})