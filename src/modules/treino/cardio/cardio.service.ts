import { prisma } from '../../../database/prisma'
import { AppError } from '../../../shared/errors/AppError'

interface CreateCardioDTO {
  registroDiarioId: number
  tipo?: string
  duracaoMinutos?: number
  feito?: boolean
}

interface UpdateCardioDTO {
  tipo?: string
  duracaoMinutos?: number
}

export class CardioService {

  async create(userId: number, data: CreateCardioDTO) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id: data.registroDiarioId, userId },
    })

    if (!registro) throw new AppError('Registro diário não encontrado', 404)

    const existente = await prisma.treinoCardio.findUnique({
      where: { registroDiarioId: data.registroDiarioId },
    })

    if (existente) throw new AppError('Já existe um treino cardio para esse dia', 409)

    return prisma.treinoCardio.create({
      data: {
        registroDiarioId: data.registroDiarioId,
        tipo: data.tipo,
        duracaoMinutos: data.duracaoMinutos,
        feito: data.feito ?? false,
      },
    })
  }

  async update(userId: number, id: number, data: UpdateCardioDTO) {
    const treino = await prisma.treinoCardio.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!treino) throw new AppError('Treino cardio não encontrado', 404)

    return prisma.treinoCardio.update({
      where: { id },
      data: {
        tipo: data.tipo,
        duracaoMinutos: data.duracaoMinutos,
      },
    })
  }

  async toggleFeito(userId: number, id: number) {
    const treino = await prisma.treinoCardio.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!treino) throw new AppError('Treino cardio não encontrado', 404)

    return prisma.treinoCardio.update({
      where: { id },
      data: { feito: !treino.feito },
    })
  }

  async remove(userId: number, id: number) {
    const treino = await prisma.treinoCardio.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!treino) throw new AppError('Treino cardio não encontrado', 404)

    await prisma.treinoCardio.delete({ where: { id } })
  }
}
