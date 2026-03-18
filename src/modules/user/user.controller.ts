import { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from './user.service'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { pipeline } from 'stream/promises'
import { prisma } from '../../database/prisma'

const userService = new UserService()

// Garante que a pasta existe
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars')
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

interface UpdateProfileBody {
  name?: string
  password?: string
  currentPassword?: string
}

export async function getProfile(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as any).sub

  const user = await userService.findById(userId)
  if (!user) return reply.status(404).send({ message: 'Usuário não encontrado' })

  return reply.send({ user })
}

export async function updateProfile(
  req: FastifyRequest<{ Body: UpdateProfileBody }>,
  reply: FastifyReply
) {
  const userId = (req.user as any).sub
  const { name, password, currentPassword } = req.body

  // Se está trocando senha, valida a senha atual
  if (password) {
    if (!currentPassword) {
      return reply.status(400).send({ message: 'Informe a senha atual' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    const bcrypt = await import('bcryptjs')
    const valid = await bcrypt.compare(currentPassword, user!.password)

    if (!valid) {
      return reply.status(400).send({ message: 'Senha atual incorreta' })
    }
  }

  const user = await userService.updateProfile(userId, { name, password })
  return reply.send({ user })
}

export async function uploadAvatar(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as any).sub

  const data = await req.file()
  if (!data) return reply.status(400).send({ message: 'Nenhum arquivo enviado' })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(data.mimetype)) {
    return reply.status(400).send({ message: 'Formato inválido. Use JPG, PNG ou WEBP' })
  }

  const ext = path.extname(data.filename) || '.jpg'
  const filename = `${randomUUID()}${ext}`
  const filepath = path.join(UPLOAD_DIR, filename)

  await pipeline(data.file, fs.createWriteStream(filepath))

  const avatarUrl = `/uploads/avatars/${filename}`
  const user = await userService.updateAvatar(userId, avatarUrl)

  return reply.send({ user })
}
