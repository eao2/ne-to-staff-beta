import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { trackingNumber, cargoType, price } = body

  const status='DELIVERED_TO_UB'
  var date = new Date()
  date = date.toISOString()

  // Step 1: Upsert cargo with isUserLabelPrinted = false by default
  let cargo = await prisma.cargoTracking.upsert({
    where: { trackingNumber: trackingNumber },
    update: {
      currentStatus: status,
      isUserLabelPrinted: false,
      cargoType: cargoType,
      price: price,
      destinationLocationId: event.context.auth.divisionId,
      deliveredToUBDate: date,
    },
    create: {
      trackingNumber: trackingNumber,
      currentStatus: status,
      cargoType: cargoType,
      price: price,
      isUserLabelPrinted: false,
      destinationLocationId: event.context.auth.divisionId,
      deliveredToUBDate: date,
    }
  })

  // Step 2: If cargo has a linked user and autoDeliveryRequest is ON
  if (cargo.user && cargo.user.autoDeliveryRequest) {
    // Check if this cargo already has a delivery request
    const alreadyRequested = await prisma.deliveryRequest.findFirst({
      where: {
        cargos: { some: { id: cargo.id } }
      }
    })

    if (!alreadyRequested) {
      await prisma.deliveryRequest.create({
        data: {
          userId: cargo.user.id,
          deliveryAddressId: cargo.user.defaultDeliveryRequestAddress?.id,
          status: 'PENDING', // or your initial status
          cargos: {
            connect: { id: cargo.id }
          }
        }
      })
    }
  }

  return {
    success: true,
    data: cargo
  }
})
