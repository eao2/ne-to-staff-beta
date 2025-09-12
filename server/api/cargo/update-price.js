// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
import prisma from '../../utils/prisma.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { trackingNumber, price } = body

  if (!trackingNumber || price === undefined) {
    throw createError({
      statusCode: 400,
      message: 'Tracking number and price are required'
    })
  }

  try {
    const updatedCargo = await prisma.cargoTracking.update({
      where: { trackingNumber },
      data: { price: Number(price) }
    })

    return updatedCargo
  } catch (error) {
    console.error('Error updating price:', error)
    throw createError({
      statusCode: 500,
      message: 'Үнийг шинэчлэхэд алдаа гарлаа!'
    })
  }
})