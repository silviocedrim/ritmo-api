import { prisma } from '../../database/prisma'; 
import bcrypt from 'bcryptjs'

export class UserService {

  async updateProfile(userId: number, data: { name?: string; password?: string }) {
    const updateData: any = {}

    if (data.name) {
      updateData.name = data.name.trim()
    }

    if (data.password) {
      if (data.password.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres')
      }
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, avatarUrl: true },
    })

    return user
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, name: true, email: true, avatarUrl: true },
    })

    return user
  }

  async findById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatarUrl: true },
    })
  }
}
