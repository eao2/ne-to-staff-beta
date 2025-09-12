// /server/api/filter-by-status/index.js
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
import prisma from '../../utils/prisma.js'

export default defineEventHandler(async (event) => {
  const { dateField, startDate, endDate, status } = await readBody(event)

  const where = {}

  if (startDate && endDate && dateField) {
    where[dateField] = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  }

  if (status) {
    where.currentStatus = status
  }

  return prisma.cargoTracking.findMany({
    where,
    include: {
      user: true
    },
    orderBy: { updatedAt: 'desc' }
  })
})
