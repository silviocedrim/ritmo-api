import argon2 from 'argon2'
import { prisma } from '../../database/prisma'
import { AppError } from '../../shared/errors/AppError'

export class AuthService {
  async register(name: string, email: string, password: string) {
    const userExists = await prisma.user.findUnique({ where: { email } })

    if (userExists) {
      throw new AppError('E-mail já cadastrado', 409)
    }

    const hashedPassword = await argon2.hash(password)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true, // 👈
        createdAt: true,
      },
    })

    return user
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new AppError('Credenciais inválidas', 401)
    }

    const passwordMatch = await argon2.verify(user.password, password)

    if (!passwordMatch) {
      throw new AppError('Credenciais inválidas', 401)
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl, 
    }
  }
}
