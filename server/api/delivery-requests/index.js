// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()
import prisma from '../../utils/prisma.js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { divisionId, status, search, page = 1, limit = 20 } = query

    const where = {
      status: status ? status : undefined,
    }

    // Add division filter if specified
    if (divisionId && divisionId !== 'all') {
      where.cargo = {
        destinationLocationId: divisionId
      }
    } else {
      where.cargo = {}
    }

    // Always exclude requests where cargo is already delivered
    where.cargo.currentStatus = {
      not: 'DELIVERED'
    }

    // Add search filter
    if (search) {
      where.OR = [
        {
          requestedByUser: {
            OR: [
              { name: { contains: search } },
              { phoneNumber: { contains: search } }
            ]
          }
        },
        {
          cargo: {
            OR: [
              { trackingNumber: { contains: search } },
              { user: { 
                OR: [
                  { name: { contains: search } },
                  { phoneNumber: { contains: search } }
                ]
              }}
            ]
          }
        },
        {
          deliveryAddress: {
            OR: [
              { provinceOrCity: { contains: search } },
              { district: { contains: search } },
              { contactPhone: { contains: search } }
            ]
          }
        }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [deliveryRequests, total] = await Promise.all([
      prisma.deliveryRequest.findMany({
        where,
        include: {
          cargo: {
            include: {
              user: true,
              destinationLocation: true
            }
          },
          requestedByUser: true,
          deliveryAddress: true,
          reviewedByStaff: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.deliveryRequest.count({ where })
    ])

    return {
      success: true,
      data: deliveryRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  } catch (error) {
    console.error('Error fetching delivery requests:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch delivery requests'
    })
  }
})
