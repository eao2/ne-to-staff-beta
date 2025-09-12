// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
import prisma from '../../utils/prisma.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { startDate, endDate, status } = body

  const divisionLocationId = event.context.auth.divisionId
  if (!divisionLocationId) {
    throw createError({ statusCode: 500, message: 'DIVISION_LOCATION_ID is not set in environment variables.' })
  }

  // Convert dates to ISO format with time boundaries
  const startDateTime = startDate ? new Date(startDate).toISOString().split('T')[0] + 'T00:00:00.000Z' : undefined
  const endDateTime = endDate ? new Date(endDate).toISOString().split('T')[0] + 'T23:59:59.999Z' : undefined

  // Modify date filter based on status
  const dateField = status === 'DELIVERED_TO_UB' ? 'deliveredToUBDate' : 
                   status === 'DELIVERED' ? 'deliveredDate' :
                   status === 'IN_TRANSIT' ? 'inTransitDate' :
                   status === 'RECEIVED_AT_ERENHOT' ? 'receivedAtErenhotDate' :
                   'preRegisteredDate'

  const dateFilter = startDateTime && endDateTime
    ? {
        [dateField]: {
          gte: new Date(startDateTime),
          lte: new Date(endDateTime),
        }
      }
    : {}

  try {
    // Get all cargos in parallel
    const [cargosWithUser, cargosWithoutUser] = await Promise.all([
      prisma.cargoTracking.findMany({
        where: {
          destinationLocationId: divisionLocationId,
          currentStatus: status,
          userId: { not: null },
          ...dateFilter
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
            }
          }
        },
        orderBy: { [dateField]: 'desc' }
      }),
      prisma.cargoTracking.findMany({
        where: {
          destinationLocationId: divisionLocationId,
          currentStatus: status,
          userId: null,
          ...dateFilter
        },
        orderBy: { [dateField]: 'desc' }
      })
    ])

    // Group cargos by user
    const groupedCargos = {}

    // Process cargos with users
    for (const cargo of cargosWithUser) {
      const key = cargo.user.phoneNumber // Using phone number as key instead of userId
      if (!groupedCargos[key]) {
        groupedCargos[key] = {
          user: cargo.user,
          cargos: [],
          totalPrice: 0
        }
      }
      groupedCargos[key].cargos.push(cargo)
      groupedCargos[key].totalPrice += Number(cargo.price || 0)
    }

    // Add cargos without users if any exist
    if (cargosWithoutUser.length > 0) {
      groupedCargos['no-user'] = {
        user: { name: 'Хэрэглэгчгүй карго', phoneNumber: '-' },
        cargos: cargosWithoutUser,
        totalPrice: cargosWithoutUser.reduce((sum, cargo) => sum + Number(cargo.price || 0), 0)
      }
    }

    return Object.values(groupedCargos)

  } catch (error) {
    console.error('Error fetching cargos:', error)
    throw createError({
      statusCode: 500,
      message: 'Алдаа гарлаа, дахин оролдоно уу!'
    })
  }
})
