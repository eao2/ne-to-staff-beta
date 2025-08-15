import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { email, password, phoneNumber, logout } = await readBody(event)

  // Handle logout request
  if (logout) {
    setCookie(event, 'token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0)
    })
    return { success: true }
  }

  if (!phoneNumber || !password) {
    setCookie(event, 'token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0)
    })
    throw createError({
      statusCode: 400,
      message: 'phone number and password are required'
    })
  }

  // If login by phoneNumber (not email)
  let user = null
  if (email) {
    user = await prisma.staffUser.findUnique({
      where: { email }
    })
  } else if (phoneNumber) {
    user = await prisma.staffUser.findUnique({
      where: { phoneNumber: String(phoneNumber) } // Ensure string
    })
  }

  if (!user || !user.password) {
    setCookie(event, 'token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0)
    })
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    setCookie(event, 'token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0)
    })
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  if (!user.isActive) {
    setCookie(event, 'token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0)
    })
    throw createError({
      statusCode: 403,
      message: 'Account is disabled'
    })
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )

  setCookie(event, 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7x24 hours
  })

  return {
    user: {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber
    }
  }
})
