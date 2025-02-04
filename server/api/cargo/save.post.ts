// server/api/cargo/save.post.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { trackingNumber, cargo, user } = body

  try {
    return await prisma.$transaction(async (tx) => {
      // Handle user association only if user data is provided
      let userId = null
      
      if (user && user.phoneNumber) {
        const dbUser = await tx.user.findUnique({
          where: { phoneNumber: user.phoneNumber }
        })

        if (dbUser) {
          userId = dbUser.id
        } else {
          const newUser = await tx.user.create({
            data: {
              phoneNumber: user.phoneNumber,
              name: user.name || null,
              surName: user.surName || null,
              userType: 'TEMPORARY'
            }
          })
          userId = newUser.id
        }
      }

      // Create or update cargo with optional user association
      const dbCargo = await tx.cargoTracking.upsert({
        where: { trackingNumber },
        update: {
          nickname: cargo.nickname,
          cargoType: cargo.cargoType,
          currentStatus: cargo.currentStatus,
          price: cargo.price ? Number(cargo.price) : null,
          userId: userId, // Will be null if no user data provided
          preRegisteredDate: cargo.preRegisteredDate,
          receivedAtErenhotDate: cargo.receivedAtErenhotDate,
          inTransitDate: cargo.inTransitDate,
          deliveredToUBDate: cargo.deliveredToUBDate,
          deliveredDate: cargo.deliveredDate
        },
        create: {
          trackingNumber,
          nickname: cargo.nickname,
          cargoType: cargo.cargoType,
          currentStatus: cargo.currentStatus,
          price: cargo.price ? Number(cargo.price) : null,
          userId: userId, // Will be null if no user data provided
          preRegisteredDate: cargo.preRegisteredDate,
          receivedAtErenhotDate: cargo.receivedAtErenhotDate,
          inTransitDate: cargo.inTransitDate,
          deliveredToUBDate: cargo.deliveredToUBDate,
          deliveredDate: cargo.deliveredDate
        }
      })

      return dbCargo
    })
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Error saving cargo information'
    })
  }
})