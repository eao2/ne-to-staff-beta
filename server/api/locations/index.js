import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const locations = await prisma.divisionLocation.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        address: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return {
      success: true,
      locations
    }
  } catch (error) {
    console.error('Error fetching locations:', error)
    throw createError({
      statusCode: 500,
      message: 'Error fetching locations'
    })
  }
})
