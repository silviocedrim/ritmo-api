import { TipoMeta } from '@prisma/client'
import { prisma } from '../../database/prisma' 
import { AppError } from '../../shared/errors/AppError'

interface CreateMetaDTO {
  tipo: TipoMeta
  valor: number
  dataAlvo?: Date
}

interface UpdateMetaDTO {
  valor?: number
  dataAlvo?: Date
  ativo?: boolean
}

export class MetaService {

  async create(userId: number, data: CreateMetaDTO) {
    const existente = await prisma.meta.findFirst({
      where: { userId, tipo: data.tipo, ativo: true },
    })

    if (existente) throw new AppError(`Já existe uma meta ativa do tipo ${data.tipo}`, 409)

    return prisma.meta.create({
      data: {
        userId,
        tipo: data.tipo,
        valor: data.valor,
        dataAlvo: data.dataAlvo ?? null,
      },
    })
  }

  async list(userId: number) {
    return prisma.meta.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async listAtivas(userId: number) {
    return prisma.meta.findMany({
      where: { userId, ativo: true },
      orderBy: { tipo: 'asc' },
    })
  }

  async update(userId: number, id: number, data: UpdateMetaDTO) {
    const meta = await prisma.meta.findFirst({
      where: { id, userId },
    })

    if (!meta) throw new AppError('Meta não encontrada', 404)

    return prisma.meta.update({
      where: { id },
      data: {
        ...(data.valor !== undefined && { valor: data.valor }),
        ...(data.dataAlvo !== undefined && { dataAlvo: data.dataAlvo }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
      },
    })
  }

  async remove(userId: number, id: number) {
    const meta = await prisma.meta.findFirst({
      where: { id, userId },
    })

    if (!meta) throw new AppError('Meta não encontrada', 404)

    await prisma.meta.delete({ where: { id } })
  }
}
