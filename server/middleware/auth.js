// server/middleware/auth.js
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getCookie, setCookie, sendRedirect, createError } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const publicRoutes = ['/api/auth/login', '/login']

  // Allow public routes and static files
  if (publicRoutes.includes(event.path) || event.path.startsWith('/_nuxt/')) {
    return
  }

  const token = getCookie(event, 'token')

  if (!token) {
    setCookie(event, 'token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0)
    })
    // Redirect to login page if not an API call
    if (!event.path.startsWith('/api/')) {
      return sendRedirect(event, '/login')
    }
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  try {
    // const decoded = verify(token, process.env.JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const staffUser = await prisma.staffUser.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        divisionId: true
      }
    })

    if (!staffUser) {
      setCookie(event, 'token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0)
      })
      if (!event.path.startsWith('/api/')) {
        return sendRedirect(event, '/login')
      }
      throw createError({
        statusCode: 401,
        message: 'User not found'
      })
    }

    event.context.auth = {
      userId: staffUser.id,
      name: staffUser.name,
      divisionId: staffUser.divisionId
    }
  } catch (error) {
    setCookie(event, 'token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0)
    })
    if (!event.path.startsWith('/api/')) {
      return sendRedirect(event, '/login')
    }
    throw createError({
      statusCode: 401, 
      message: 'Invalid or expired token'
    })
  }
})