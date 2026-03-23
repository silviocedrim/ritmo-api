// treino-atividade.service.ts
import { TipoAtividade } from '@prisma/client'
import { prisma } from '../../../database/prisma'
import { AppError } from '../../../shared/errors/AppError'
import { MetaService } from 'modules/meta/meta.service' 

const metaService = new MetaService()

interface CreateDTO {
  registroDiarioId: number
  tipo: TipoAtividade
  divisaoTreinoId?: number
  duracaoMinutos?: number
  observacao?: string
  feito: boolean
}

interface UpdateDTO {
  tipo?: TipoAtividade
  divisaoTreinoId?: number
  duracaoMinutos?: number
  observacao?: string
}

export class TreinoAtividadeService {

  async create(userId: number, data: CreateDTO) {
    const { registroDiarioId, tipo, divisaoTreinoId, duracaoMinutos, observacao, feito } = data

    const registro = await prisma.registroDiario.findFirst({
      where: { id: registroDiarioId, userId },
    })
    if (!registro) throw new AppError('Registro diário não encontrado', 404)

    this.validarDivisao(tipo, divisaoTreinoId)

    if (divisaoTreinoId) {
      const divisao = await prisma.divisaoTreino.findFirst({
        where: { id: divisaoTreinoId, userId, ativo: true },
      })
      if (!divisao) throw new AppError('Divisão de treino não encontrada', 404)
    }

    const existente = await prisma.treinoAtividade.findUnique({
      where: { registroDiarioId },
    })
    if (existente) throw new AppError('Já existe um treino registrado para esse dia', 409)

    const treino = await prisma.treinoAtividade.create({
      data: { registroDiarioId, tipo, divisaoTreinoId, duracaoMinutos, observacao, feito },
      include: { divisaoTreino: true },
    })

    // ✅ Verifica metas apenas se o treino foi marcado como feito
    if (feito) {
      await metaService.verificarCicloTreinosSemana(userId)
    }

    return treino
  }

  async toggleFeito(userId: number, id: number) {
    const treino = await prisma.treinoAtividade.findFirst({
      where: { id, registroDiario: { userId } },
    })
    if (!treino) throw new AppError('Treino não encontrado', 404)

    const atualizado = await prisma.treinoAtividade.update({
      where: { id },
      data: { feito: !treino.feito },
      include: { divisaoTreino: true },
    })

    // ✅ Verifica metas sempre que o estado muda (tanto ao marcar quanto desmarcar)
    await metaService.verificarCicloTreinosSemana(userId)

    return atualizado
  }

  async update(userId: number, id: number, data: UpdateDTO) {
    const treino = await prisma.treinoAtividade.findFirst({
      where: { id, registroDiario: { userId } },
    })
    if (!treino) throw new AppError('Treino não encontrado', 404)

    const tipoFinal    = data.tipo ?? treino.tipo
    const divisaoFinal = 'divisaoTreinoId' in data
      ? data.divisaoTreinoId
      : treino.divisaoTreinoId ?? undefined

    this.validarDivisao(tipoFinal, divisaoFinal)

    if (divisaoFinal) {
      const divisao = await prisma.divisaoTreino.findFirst({
        where: { id: divisaoFinal, userId, ativo: true },
      })
      if (!divisao) throw new AppError('Divisão de treino não encontrada', 404)
    }

    // update não muda o campo feito, então não afeta metas
    return prisma.treinoAtividade.update({
      where: { id },
      data: {
        tipo:            tipoFinal,
        divisaoTreinoId: divisaoFinal ?? null,
        duracaoMinutos:  data.duracaoMinutos,
        observacao:      data.observacao,
      },
      include: { divisaoTreino: true },
    })
  }

  async remove(userId: number, id: number) {
    const treino = await prisma.treinoAtividade.findFirst({
      where: { id, registroDiario: { userId } },
    })
    if (!treino) throw new AppError('Treino não encontrado', 404)

    await prisma.treinoAtividade.delete({ where: { id } })

    // ✅ Ao remover, reavalia pois pode ter quebrado uma meta
    await metaService.verificarCicloTreinosSemana(userId)
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private validarDivisao(tipo: TipoAtividade, divisaoTreinoId?: number) {
    if (tipo === 'MUSCULACAO' && !divisaoTreinoId) {
      throw new AppError('Divisão de treino é obrigatória para musculação', 422)
    }
    if (tipo !== 'MUSCULACAO' && divisaoTreinoId) {
      throw new AppError('Divisão de treino só é permitida para musculação', 422)
    }
  }
}
