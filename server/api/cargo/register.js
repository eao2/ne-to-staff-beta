import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { trackingNumber, cargoType, price } = body

  if (!trackingNumber) {
    throw createError({
      statusCode: 400,
      message: 'Tracking number is required'
    })
  }

  const currentTime = new Date().toISOString()

  try {
    const existingCargo = await prisma.cargoTracking.findUnique({
      where: { trackingNumber }
    })

    if (existingCargo) {
      // Update existing cargo
      const updatedCargo = await prisma.cargoTracking.update({
        where: { trackingNumber },
        data: {
          cargoType: cargoType || existingCargo.cargoType,
          price: price !== undefined ? Number(price) : existingCargo.price,
          currentStatus: 'DELIVERED_TO_UB',
          deliveredToUBDate: currentTime,
          updatedAt: currentTime
        }
      })
      return { success: true, cargo: updatedCargo }
    } else {
      // Create new cargo entry
      const newCargo = await prisma.cargoTracking.create({
        data: {
          trackingNumber,
          cargoType: cargoType || 'NORMAL',
          price: price !== undefined ? Number(price) : null,
          currentStatus: 'DELIVERED_TO_UB',
          deliveredToUBDate: currentTime,
          createdAt: currentTime,
          updatedAt: currentTime
        }
      })
      return { success: true, cargo: newCargo }
    }
  } catch (error) {
    console.error('Error registering cargo:', error)
    throw createError({
      statusCode: 500,
      message: 'Error registering cargo'
    })
  } finally {
    await prisma.$disconnect()
  }
})