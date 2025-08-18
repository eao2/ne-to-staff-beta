import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { requestId } = body

    if (!requestId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request ID is required'
      })
    }

    var date = new Date()
    date = date.toISOString() 

    // First check if the delivery request is approved
    const deliveryRequest = await prisma.deliveryRequest.findUnique({
      where: { id: requestId },
      include: { cargo: true }
    })

    if (!deliveryRequest) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Delivery request not found'
      })
    }

    if (deliveryRequest.status !== 'APPROVED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Can only mark delivered for approved requests'
      })
    }

    // Update only the cargo status to DELIVERED
    await prisma.cargoTracking.update({
      where: { id: deliveryRequest.cargoId },
      data: {
        currentStatus: 'DELIVERED',
        deliveredDate: date
      }
    })

    // Get the updated delivery request
    const updatedRequest = await prisma.deliveryRequest.findUnique({
      where: { id: requestId },
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
      }
    })

    return {
      success: true,
      data: updatedRequest,
      message: 'Cargo marked as delivered successfully'
    }
  } catch (error) {
    console.error('Error marking cargo as delivered:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to mark cargo as delivered'
    })
  }
})
