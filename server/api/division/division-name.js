// server/api/division/division-name.js
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
import prisma from '../../utils/prisma.js'

export default defineEventHandler(async (event) => {
  const divisionId = event.context.auth.divisionId

  if (!divisionId) {
    await prisma.$disconnect()
    throw createError({
      statusCode: 500,
      statusMessage: 'DIVISION_LOCATION_ID not set in environment variables'
    })
  }

  try {
    const division = await prisma.divisionLocation.findUnique({
      where: { id: divisionId },
      select: {
        id: true,
        name: true
      }
    })

    if (!division) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Division not found'
      })
    }

    return division
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching division',
      data: error.message
    })
  } finally {
    await prisma.$disconnect()
  }
})
