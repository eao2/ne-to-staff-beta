// server/api/cargo/set-delivered-to-ub.post.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { trackingNumber, cargo = {}, user: userInBody } = body

  if (!trackingNumber) throw createError({ statusCode: 400, message: 'Tracking number is required' })

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingCargo = await tx.cargoTracking.findUnique({ where: { trackingNumber } })

      // resolve userId
      let userId = existingCargo?.userId ?? null
      if (userInBody?.phoneNumber) {
        const dbUser = await tx.user.findUnique({ where: { phoneNumber: userInBody.phoneNumber } })
        if (dbUser) userId = dbUser.id
        else if (userInBody.name) {
          const newUser = await tx.user.create({
            data: { phoneNumber: userInBody.phoneNumber, name: userInBody.name, userType: 'TEMPORARY' }
          })
          userId = newUser.id
        }
      }

      const now = new Date()
      const updateData = {
        currentStatus: 'DELIVERED_TO_UB',
        deliveredToUBDate: now,
        userId,
        isUserLabelPrinted: !!userInBody?.phoneNumber,
        destinationLocationId: event.context?.auth?.divisionId ?? existingCargo?.destinationLocationId ?? null,
        updatedAt: now
      }
      if (cargo.price !== undefined) updateData.price = Number(cargo.price)
      if (cargo.cargoType) updateData.cargoType = cargo.cargoType
      if (cargo.nickname) updateData.nickname = cargo.nickname

      const savedCargo = await tx.cargoTracking.upsert({
        where: { trackingNumber },
        update: updateData,
        create: {
          trackingNumber: trackingNumber.trim(),
          ...updateData,
          cargoType: cargo.cargoType || 'NORMAL',
          nickname: cargo.nickname || null,
          price: cargo.price !== undefined ? Number(cargo.price) : null,
          createdAt: now
        }
      })

      // create DeliveryRequest if user wants autoDeliveryRequest and has defaultDeliveryAddress
      let createdDeliveryRequest = null
      if (savedCargo.userId) {
        const u = await tx.user.findUnique({ where: { id: savedCargo.userId }, select: { id: true, autoDeliveryRequest: true, defaultDeliveryAddressId: true } })
        if (u?.autoDeliveryRequest && u?.defaultDeliveryAddressId) {
          const exists = await tx.deliveryRequest.findFirst({ where: { cargoId: savedCargo.id } })
          if (!exists) {
            createdDeliveryRequest = await tx.deliveryRequest.create({
              data: {
                cargoId: savedCargo.id,
                requestedByUserId: u.id,
                deliveryAddressId: u.defaultDeliveryAddressId,
                status: 'PENDING'
              },
              select: { id: true, status: true, createdAt: true, deliveryAddressId: true, cargoId: true }
            })
          }
        }
      }

      return { cargo: savedCargo, deliveryRequest: createdDeliveryRequest }
    })

    // map result to plain object (avoid Prisma prototypes)
    const mappedCargo = {
      id: result.cargo.id,
      trackingNumber: result.cargo.trackingNumber,
      currentStatus: result.cargo.currentStatus,
      cargoType: result.cargo.cargoType,
      price: result.cargo.price ? String(result.cargo.price) : null,
      userId: result.cargo.userId,
      deliveredToUBDate: result.cargo.deliveredToUBDate
    }
    return { cargo: mappedCargo, deliveryRequest: result.deliveryRequest ?? null }
  } catch (err) {
    console.error('set-delivered-to-ub error:', err)
    throw createError({ statusCode: 500, message: 'Error saving cargo information' })
  } finally {
    await prisma.$disconnect()
  }
})
