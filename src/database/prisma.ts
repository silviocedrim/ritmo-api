import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

// PrismaClient com o adapter — export padrão
export const prisma = new PrismaClient({ adapter } as any)
