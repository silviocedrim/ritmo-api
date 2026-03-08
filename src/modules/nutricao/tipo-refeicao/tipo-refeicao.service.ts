import { prisma } from '../../../database/prisma'
import { AppError } from '../../../shared/errors/AppError'

interface CreateTipoRefeicaoDTO {
  nome: string
  emoji?: string
  horario?: string
  ordem?: number
}

interface UpdateTipoRefeicaoDTO {
  nome?: string
  emoji?: string
  horario?: string
  ordem?: number
  ativo?: boolean
}

export class TipoRefeicaoService {

  async create(userId: number, data: CreateTipoRefeicaoDTO) {
    const existente = await prisma.configTipoRefeicao.findUnique({
      where: { userId_nome: { userId, nome: data.nome } },
    })

    if (existente) throw new AppError(`Já existe um tipo de refeição com o nome "${data.nome}"`, 409)

    return prisma.configTipoRefeicao.create({
      data: {
        userId,
        nome: data.nome,
        emoji: data.emoji ?? null,
        horario: data.horario ?? null,
        ordem: data.ordem ?? 0,
      },
    })
  }

  async list(userId: number) {
    return prisma.configTipoRefeicao.findMany({
      where: { userId },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })
  }

  async listAtivos(userId: number) {
    return prisma.configTipoRefeicao.findMany({
      where: { userId, ativo: true },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    })
  }

  async update(userId: number, id: number, data: UpdateTipoRefeicaoDTO) {
    const tipo = await prisma.configTipoRefeicao.findFirst({
      where: { id, userId },
    })

    if (!tipo) throw new AppError('Tipo de refeição não encontrado', 404)

    if (data.nome && data.nome !== tipo.nome) {
      const existente = await prisma.configTipoRefeicao.findUnique({
        where: { userId_nome: { userId, nome: data.nome } },
      })
      if (existente) throw new AppError(`Já existe um tipo de refeição com o nome "${data.nome}"`, 409)
    }

    return prisma.configTipoRefeicao.update({
      where: { id },
      data: {
        ...(data.nome !== undefined     && { nome: data.nome }),
        ...(data.emoji !== undefined    && { emoji: data.emoji }),
        ...(data.horario !== undefined  && { horario: data.horario }),
        ...(data.ordem !== undefined    && { ordem: data.ordem }),
        ...(data.ativo !== undefined    && { ativo: data.ativo }),
      },
    })
  }

  async remove(userId: number, id: number) {
    const tipo = await prisma.configTipoRefeicao.findFirst({
      where: { id, userId },
    })

    if (!tipo) throw new AppError('Tipo de refeição não encontrado', 404)

    const emUso = await prisma.refeicao.findFirst({
      where: { configTipoRefeicaoId: id },
    })

    if (emUso) throw new AppError('Não é possível excluir: tipo em uso em registros diários', 409)

    await prisma.configTipoRefeicao.delete({ where: { id } })
  }
}
