import { PrismaClient, CargoStatus, CargoType, PaymentStatus } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get delivered revenue
  const deliveredRevenue = await prisma.cargoTracking.aggregate({
    where: {
      deliveredDate: {
        gte: today,
        lt: tomorrow
      },
      currentStatus: CargoStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      price: { not: null },
      destinationLocationId: event.context.auth.divisionId
    },
    _sum: {
      price: true
    }
  })

  // Get delivered to UB revenue
  const deliveredToUBRevenue = await prisma.cargoTracking.aggregate({
    where: {
      // currentStatus: CargoStatus.DELIVERED_TO_UB,
      deliveredToUBDate: {
        gte: today,
        lt: tomorrow
      },
      // paymentStatus: PaymentStatus.PAID,
      price: { not: null },
      destinationLocationId: event.context.auth.divisionId  // added division filter
    },
    _sum: {
      price: true
    }
  })

  // Get cargo counts by type for delivered items today
  const [normalCount, quickCount] = await Promise.all([
    prisma.cargoTracking.count({
      where: {
        deliveredDate: {
          gte: today,
          lt: tomorrow
        },
        currentStatus: CargoStatus.DELIVERED,
        cargoType: CargoType.NORMAL,
        destinationLocationId: event.context.auth.divisionId
      }
    }),
    prisma.cargoTracking.count({
      where: {
        deliveredDate: {
          gte: today,
          lt: tomorrow
        },
        currentStatus: CargoStatus.DELIVERED,
        cargoType: CargoType.QUICK,
        destinationLocationId: event.context.auth.divisionId
      }
    })
  ])

  return {
    revenue: Number(deliveredRevenue._sum.price || 0),
    deliveredToUBRevenue: Number(deliveredToUBRevenue._sum.price || 0),
    normalCount,
    quickCount
  }
})