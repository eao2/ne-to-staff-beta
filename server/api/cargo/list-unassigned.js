// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
import prisma from '../../utils/prisma.js'

export default defineEventHandler(async (event) => {
  try {
    const cargos = await prisma.cargoTracking.findMany({
      where: {
        userId: null,
        isUserLabelPrinted: false,
        currentStatus: 'DELIVERED_TO_UB',
        destinationLocationId: event.context.auth.divisionId
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