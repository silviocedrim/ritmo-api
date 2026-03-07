import { prisma } from "../../../database/prisma" 
import { AppError } from "../../../shared/errors/AppError" 

export class TreinoMusculacaoService {

  async create(userId: number, registroDiarioId: number, divisaoTreinoId: number, feito = false) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id: registroDiarioId, userId },
    })
    if (!registro) throw new AppError('Registro diário não encontrado', 404)

    const divisao = await prisma.divisaoTreino.findFirst({
      where: { id: divisaoTreinoId, userId, ativo: true },
    })
    if (!divisao) throw new AppError('Divisão de treino não encontrada', 404)

    const existente = await prisma.treinoMusculacao.findUnique({
      where: { registroDiarioId },
    })
    if (existente) throw new AppError('Já existe um treino musculação para esse dia', 409)

    return prisma.treinoMusculacao.create({
      data: { registroDiarioId, divisaoTreinoId, feito }, // ← feito aqui
      include: { divisaoTreino: true },
    })
  }


  async toggleFeito(userId: number, id: number) {
    const treino = await prisma.treinoMusculacao.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!treino) throw new AppError('Treino não encontrado', 404)

    return prisma.treinoMusculacao.update({
      where: { id },
      data: { feito: !treino.feito },
      include: { divisaoTreino: true },
    })
  }

  async update(userId: number, id: number, divisaoTreinoId: number) {
    const treino = await prisma.treinoMusculacao.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!treino) throw new AppError('Treino não encontrado', 404)

    const divisao = await prisma.divisaoTreino.findFirst({
      where: { id: divisaoTreinoId, userId, ativo: true },
    })

    if (!divisao) throw new AppError('Divisão de treino não encontrada', 404)

    return prisma.treinoMusculacao.update({
      where: { id },
      data: { divisaoTreinoId },
      include: { divisaoTreino: true },
    })
  }

  async remove(userId: number, id: number) {
    const treino = await prisma.treinoMusculacao.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!treino) throw new AppError('Treino não encontrado', 404)

    await prisma.treinoMusculacao.delete({ where: { id } })
  }
}
