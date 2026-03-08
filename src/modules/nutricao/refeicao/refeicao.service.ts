import type { $Enums } from '@prisma/client'
import { prisma } from '../../../database/prisma'
import { AppError } from '../../../shared/errors/AppError'

type TipoRefeicao = $Enums.TipoRefeicao  // ✅

interface CreateRefeicaoDTO {
  registroDiarioId: number
  tipo: TipoRefeicao
}

export class RefeicaoService {

  async create(userId: number, data: CreateRefeicaoDTO) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id: data.registroDiarioId, userId },
    })

    if (!registro) throw new AppError('Registro diário não encontrado', 404)

    const existente = await prisma.refeicao.findUnique({
      where: {
        registroDiarioId_tipo: {
          registroDiarioId: data.registroDiarioId,
          tipo: data.tipo,
        },
      },
    })

    if (existente) throw new AppError(`Já existe uma refeição do tipo ${data.tipo} para esse dia`, 409)

    return prisma.refeicao.create({
      data: {
        registroDiarioId: data.registroDiarioId,
        tipo: data.tipo,
      },
    })
  }

  async listByRegistro(userId: number, registroDiarioId: number) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id: registroDiarioId, userId },
    })

    if (!registro) throw new AppError('Registro diário não encontrado', 404)

    return prisma.refeicao.findMany({
      where: { registroDiarioId },
      orderBy: { tipo: 'asc' },
    })
  }

  async toggleFeito(userId: number, id: number) {
    const refeicao = await prisma.refeicao.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!refeicao) throw new AppError('Refeição não encontrada', 404)

    return prisma.refeicao.update({
      where: { id },
      data: { feito: !refeicao.feito },
    })
  }

  async remove(userId: number, id: number) {
    const refeicao = await prisma.refeicao.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!refeicao) throw new AppError('Refeição não encontrada', 404)

    await prisma.refeicao.delete({ where: { id } })
  }
}
