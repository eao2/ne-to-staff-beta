import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { cargoId, status } = body

  // Step 1: Upsert cargo with isUserLabelPrinted = false by default
  let cargo = await prisma.cargoTracking.upsert({
    where: { id: cargoId },
    update: {
      currentStatus: status,
      isUserLabelPrinted: false
    },
    create: {
      id: cargoId,
      currentStatus: status,
      isUserLabelPrinted: false
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          email: true,
          autoDeliveryRequest: true,
          defaultDeliveryRequestAddress: {
            select: {
              id: true,
              label: true,
              addressLine: true,
              city: true,
              region: true
            }
          }
        }
      }
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
