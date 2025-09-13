// server/utils/prisma.js
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  globalForPrisma.prisma.$connect()
    .then(() => console.log('✅ Prisma connected'))
    .catch(err => console.error('❌ Prisma connection error', err))

  const shutdown = async () => {
    console.log('⏹ Shutting down, disconnecting Prisma...')
    try {
      await globalForPrisma.prisma.$disconnect()
      console.log('✅ Prisma disconnected')
    } catch (err) {
      console.error('⚠️ Error during Prisma disconnect', err)
    } finally {
      process.exit(0)
    }
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

const prisma = globalForPrisma.prisma

export default prisma
