import { prisma } from '../../../database/prisma'
import { AppError } from '../../../shared/errors/AppError'

interface CreateRefeicaoDTO {
  registroDiarioId: number
  configTipoRefeicaoId: number  // ✅ substituiu TipoRefeicao enum
}

export class RefeicaoService {

  async create(userId: number, data: CreateRefeicaoDTO) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id: data.registroDiarioId, userId },
    })
    if (!registro) throw new AppError('Registro diário não encontrado', 404)

    // garante que o tipo pertence ao usuário
    const tipo = await prisma.configTipoRefeicao.findFirst({
      where: { id: data.configTipoRefeicaoId, userId, ativo: true },
    })
    if (!tipo) throw new AppError('Tipo de refeição não encontrado', 404)

    const existente = await prisma.refeicao.findUnique({
      where: {
        registroDiarioId_configTipoRefeicaoId: {
          registroDiarioId: data.registroDiarioId,
          configTipoRefeicaoId: data.configTipoRefeicaoId,
        },
      },
    })
    if (existente) throw new AppError(`Já existe uma refeição "${tipo.nome}" para esse dia`, 409)

    return prisma.refeicao.create({
      data: {
        registroDiarioId: data.registroDiarioId,
        configTipoRefeicaoId: data.configTipoRefeicaoId,
      },
      include: { configTipoRefeicao: true },
    })
  }

  async listByRegistro(userId: number, registroDiarioId: number) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id: registroDiarioId, userId },
    })
    if (!registro) throw new AppError('Registro diário não encontrado', 404)

    return prisma.refeicao.findMany({
      where: { registroDiarioId },
      include: { configTipoRefeicao: true },
      orderBy: { configTipoRefeicao: { ordem: 'asc' } },
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
      include: { configTipoRefeicao: true },
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
