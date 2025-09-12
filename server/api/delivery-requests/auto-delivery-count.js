// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()
import prisma from '../../utils/prisma.js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { userId } = query

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Get cargo counts by status for this user
    const cargoCounts = await prisma.cargoTracking.groupBy({
      by: ['currentStatus'],
      where: {
        userId: userId,
        currentStatus: {
          not: 'DELIVERED'
        }
      },
      _count: {
        currentStatus: true
      }
    })

    // Get total count
    const totalCount = await prisma.cargoTracking.count({
      where: {
        userId: userId,
        currentStatus: {
          not: 'DELIVERED'
        }
      }
    })

    // Format the response
    const statusCounts = {}
    cargoCounts.forEach(item => {
      statusCounts[item.currentStatus] = item._count.currentStatus
    })

    return {
      success: true,
      data: {
        total: totalCount,
        byStatus: statusCounts
      }
    }
  } catch (error) {
    console.error('Error fetching auto delivery counts:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch auto delivery counts'
    })
  }
})
