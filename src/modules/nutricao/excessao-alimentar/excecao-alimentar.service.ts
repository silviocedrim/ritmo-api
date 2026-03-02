import { prisma } from '../../../database/prisma' 
import { AppError } from '../../../shared/errors/AppError'

interface CreateExcecaoDTO {
  registroDiarioId: number
  descricao: string
}

interface UpdateExcecaoDTO {
  descricao: string
}

export class ExcecaoAlimentarService {

  async create(userId: number, data: CreateExcecaoDTO) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id: data.registroDiarioId, userId },
    })

    if (!registro) throw new AppError('Registro diário não encontrado', 404)

    const existente = await prisma.excecaoAlimentar.findUnique({
      where: { registroDiarioId: data.registroDiarioId },
    })

    if (existente) throw new AppError('Já existe uma exceção alimentar para esse dia', 409)

    return prisma.excecaoAlimentar.create({
      data: {
        registroDiarioId: data.registroDiarioId,
        descricao: data.descricao,
      },
    })
  }

  async update(userId: number, id: number, data: UpdateExcecaoDTO) {
    const excecao = await prisma.excecaoAlimentar.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!excecao) throw new AppError('Exceção alimentar não encontrada', 404)

    return prisma.excecaoAlimentar.update({
      where: { id },
      data: { descricao: data.descricao },
    })
  }

  async remove(userId: number, id: number) {
    const excecao = await prisma.excecaoAlimentar.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!excecao) throw new AppError('Exceção alimentar não encontrada', 404)

    await prisma.excecaoAlimentar.delete({ where: { id } })
  }
}
