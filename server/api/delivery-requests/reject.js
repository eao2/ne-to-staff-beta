import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { requestId, staffResponse } = body

    if (!requestId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request ID is required'
      })
    }

    const updatedRequest = await prisma.deliveryRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        staffResponse: staffResponse || null,
        reviewedAt: new Date(),
        reviewedByStaffId: event.context.auth?.userId // Staff user from auth middleware
      },
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
      message: 'Delivery request rejected successfully'
    }
  } catch (error) {
    console.error('Error rejecting delivery request:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to reject delivery request'
    })
  }
})
