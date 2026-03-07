import { TipoMeta } from '@prisma/client'
import { prisma } from '../../database/prisma' 
import { AppError } from '../../shared/errors/AppError'
import { inicioDaSemana, fimDaSemana, inicioDoDia, fimDoDia } from '../../shared/utils/date.utils'

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

  async progressoTreinosSemana(userId: number) {
    const hoje = new Date();
    const inicio = inicioDaSemana(hoje);
    const fim    = fimDaSemana(hoje);
    // Todos os registros da semana com treino musculação feito
    const registros = await prisma.registroDiario.findMany({
      where: {
        userId,
        data: { gte: inicio, lte: fim },
        treinoMusculacao: { feito: true },
      },
      select: { id: true, data: true },
    });
    // Meta ativa do tipo TREINOS_POR_SEMANA
    const meta = await prisma.meta.findFirst({
      where: { userId, tipo: 'TREINOS_POR_SEMANA', ativo: true },
    });
    const feitos = registros.length;
    const alvo   = meta ? Number(meta.valor) : null;
    return {
      feitos,
      alvo,
      progresso: alvo ? Math.min(feitos / alvo, 1) : null,
      cumprida:  alvo ? feitos >= alvo : false,
      diasFeitos: registros.map((r) => r.data),
    };
  }
  async progressoRefeicoes(userId: number) {
    const hoje = new Date();
    // ── % do dia atual ────────────────────────────────────────────────────────
    const registroHoje = await prisma.registroDiario.findFirst({
      where: {
        userId,
        data: { gte: inicioDoDia(hoje), lte: fimDoDia(hoje) },
      },
      include: { refeicoes: true },
    });
    const totalHoje  = registroHoje?.refeicoes.length ?? 0;
    const feitasHoje = registroHoje?.refeicoes.filter((r) => r.feito).length ?? 0;
    const percentualHoje = totalHoje > 0 ? Math.round((feitasHoje / totalHoje) * 100) : 0;
    // ── streak (dias consecutivos com TODAS refeições feitas) ─────────────────
    // Busca os últimos 60 dias para calcular o streak
    const sessenta = new Date(hoje);
    sessenta.setDate(sessenta.getDate() - 60);
    const registros = await prisma.registroDiario.findMany({
      where: {
        userId,
        data: { gte: sessenta },
      },
      include: { refeicoes: true },
      orderBy: { data: 'desc' },
    });
    // Dia com todas refeições feitas = pelo menos 1 refeição e todas feito=true
    function todasFeitas(refeicoes: { feito: boolean }[]) {
      return refeicoes.length > 0 && refeicoes.every((r) => r.feito);
    }
    // Constrói o streak a partir de hoje pra trás
    let streak = 0;
    let cursor = new Date(hoje);
    cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < 60; i++) {
      const dataStr = cursor.toISOString().split('T')[0];
      const reg = registros.find((r) => {
        const d = new Date(r.data);
        return d.toISOString().split('T')[0] === dataStr;
      });
      // Hoje: conta mesmo que ainda não terminou (ao menos 1 feita)
      if (i === 0) {
        if (reg && reg.refeicoes.some((r) => r.feito)) streak++;
        // não quebra o streak no dia atual
      } else {
        if (!reg || !todasFeitas(reg.refeicoes)) break;
        streak++;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    // Meta ativa do tipo REFEICOES_CONSECUTIVAS
    const meta = await prisma.meta.findFirst({
      where: { userId, tipo: 'REFEICOES_CONSECUTIVAS', ativo: true },
    });
    const alvo = meta ? Number(meta.valor) : null;
    return {
      // streak
      streak,
      alvoStreak:       alvo,
      progressoStreak:  alvo ? Math.min(streak / alvo, 1) : null,
      cumprida:         alvo ? streak >= alvo : false,
      // dia atual
      feitasHoje,
      totalHoje,
      percentualHoje,
    };
  }
}


