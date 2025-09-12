// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()
import prisma from '../../utils/prisma.js'

export default defineEventHandler(async (event) => {
  try {
    const divisions = await prisma.divisionLocation.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        city: true,
        country: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return {
      success: true,
      data: divisions
    }
  } catch (error) {
    console.error('Error fetching divisions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch divisions'
    })
  }
})
