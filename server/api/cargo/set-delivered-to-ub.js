// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
import prisma from '../../utils/prisma.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { trackingNumber, cargo = {}, user: userInBody } = body

  if (!trackingNumber) {
    throw createError({
      statusCode: 400,
      message: 'Tracking number is required'
    })
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Find existing cargo if any
      const existingCargo = await tx.cargoTracking.findUnique({
        where: { trackingNumber }
      })

      // Resolve user by existingCargo.userId or incoming phone number
      let userId = existingCargo?.userId ?? null
      let isUserLabelPrinted = false

      if (userInBody?.phoneNumber) {
        isUserLabelPrinted = true
        const dbUser = await tx.user.findUnique({
          where: { phoneNumber: userInBody.phoneNumber }
        })
        if (dbUser) {
          userId = dbUser.id
        } else if (userInBody.name) {
          const newUser = await tx.user.create({
            data: {
              phoneNumber: userInBody.phoneNumber,
              name: userInBody.name,
              userType: 'TEMPORARY'
            }
          })
          userId = newUser.id
        }
      }

      // Build updateData (only set fields provided)
      const currentTime = new Date()
      const updateData = {
        currentStatus: 'DELIVERED_TO_UB',
        deliveredToUBDate: currentTime,
        userId,
        isUserLabelPrinted,
        destinationLocationId: event.context?.auth?.divisionId ?? existingCargo?.destinationLocationId ?? null,
        updatedAt: currentTime
      }

      if (cargo.price !== undefined) updateData.price = Number(cargo.price)
      if (cargo.cargoType) updateData.cargoType = cargo.cargoType
      if (cargo.nickname) updateData.nickname = cargo.nickname

      // Upsert cargo
      const savedCargo = await tx.cargoTracking.upsert({
        where: { trackingNumber },
        update: updateData,
        create: {
          trackingNumber: trackingNumber.trim(),
          ...updateData,
          cargoType: cargo.cargoType || 'NORMAL',
          nickname: cargo.nickname || null,
          price: cargo.price !== undefined ? Number(cargo.price) : null,
          createdAt: currentTime
        }
      })

      // After cargo saved, check autoDeliveryRequest
      if (savedCargo.userId) {
        // fetch user and their default address
        const u = await tx.user.findUnique({
          where: { id: savedCargo.userId },
          select: {
            id: true,
            autoDeliveryRequest: true,
            defaultDeliveryAddressId: true
          }
        })

        if (u?.autoDeliveryRequest && u?.defaultDeliveryAddressId) {
          // create DeliveryRequest if not exists
          const exists = await tx.deliveryRequest.findFirst({
            where: { cargoId: savedCargo.id }
          })
          if (!exists) {
            const createdReq = await tx.deliveryRequest.create({
              data: {
                cargoId: savedCargo.id,
                requestedByUserId: u.id,
                deliveryAddressId: u.defaultDeliveryAddressId,
                status: 'PENDING'
              }
            })
            // return cargo + created delivery request in response
            return { cargo: savedCargo, deliveryRequest: createdReq }
          }
        }
      }

      return { cargo: savedCargo }
    })
  } catch (error) {
    console.error('Error saving cargo:', error)
    throw createError({
      statusCode: 500,
      message: 'Error saving cargo information'
    })
  } finally {
    await prisma.$disconnect()
  }
})
