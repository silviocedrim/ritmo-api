import { prisma } from '../../database/prisma'
import { AppError } from '../../shared/errors/AppError'
import { inicioDaSemana, fimDaSemana, inicioDoDia, fimDoDia } from '../../shared/utils/date.utils'
import type { $Enums } from '@prisma/client'
type TipoMeta = $Enums.TipoMeta

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

const TIPOS_COM_CICLO: TipoMeta[] = ['TREINOS_POR_SEMANA', 'REFEICOES_CONSECUTIVAS']

export class MetaService {

  // ─── CRUD básico ────────────────────────────────────────────────────────────

  async create(userId: number, data: CreateMetaDTO) {
    const existente = await prisma.meta.findFirst({
      where: { userId, tipo: data.tipo, ativo: true },
    })
    if (existente) throw new AppError(`Já existe uma meta ativa do tipo ${data.tipo}`, 409)

    const meta = await prisma.meta.create({
      data: { userId, tipo: data.tipo, valor: data.valor, dataAlvo: data.dataAlvo ?? null },
    })

    if (TIPOS_COM_CICLO.includes(meta.tipo)) {
      await prisma.metaCiclo.create({
        data: { metaId: meta.id, ciclo: 1, valorAlvo: data.valor },
      })
    }

    return meta
  }

  async list(userId: number) {
    return prisma.meta.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  }

  async listAtivas(userId: number) {
    return prisma.meta.findMany({ where: { userId, ativo: true }, orderBy: { tipo: 'asc' } })
  }

  async update(userId: number, id: number, data: UpdateMetaDTO) {
    const meta = await prisma.meta.findFirst({ where: { id, userId } })
    if (!meta) throw new AppError('Meta não encontrada', 404)

    if (
      data.valor !== undefined &&
      data.valor !== Number(meta.valor) &&
      TIPOS_COM_CICLO.includes(meta.tipo)
    ) {
      await this.fecharCicloAtivo(meta.id)
      await this.abrirNovoCiclo(meta.id, data.valor)
    }

    return prisma.meta.update({
      where: { id },
      data: {
        ...(data.valor    !== undefined && { valor:    data.valor }),
        ...(data.dataAlvo !== undefined && { dataAlvo: data.dataAlvo }),
        ...(data.ativo    !== undefined && { ativo:    data.ativo }),
      },
    })
  }

  async remove(userId: number, id: number) {
    const meta = await prisma.meta.findFirst({ where: { id, userId } })
    if (!meta) throw new AppError('Meta não encontrada', 404)
    await prisma.meta.delete({ where: { id } })
  }

  async upsert(userId: number, data: CreateMetaDTO) {
    const existente = await prisma.meta.findFirst({
      where: { userId, tipo: data.tipo, ativo: true },
    })

    if (existente) {
      if (
        data.valor !== Number(existente.valor) &&
        TIPOS_COM_CICLO.includes(existente.tipo)
      ) {
        await this.fecharCicloAtivo(existente.id)
        await this.abrirNovoCiclo(existente.id, data.valor)
      }

      return prisma.meta.update({
        where: { id: existente.id },
        data:  { valor: data.valor, dataAlvo: data.dataAlvo ?? null },
      })
    }

    const meta = await prisma.meta.create({
      data: { userId, tipo: data.tipo, valor: data.valor, dataAlvo: data.dataAlvo ?? null },
    })

    if (TIPOS_COM_CICLO.includes(meta.tipo)) {
      await prisma.metaCiclo.create({
        data: { metaId: meta.id, ciclo: 1, valorAlvo: data.valor },
      })
    }

    return meta
  }

  // ─── Verificação de ciclos ──────────────────────────────────────────────────

  async verificarCicloRefeicoes(userId: number) {
  const meta = await prisma.meta.findFirst({
    where: { userId, tipo: 'REFEICOES_CONSECUTIVAS', ativo: true },
  })
  if (!meta) return

  const hoje     = new Date()
  const dataBase = this.diaLocal(meta.createdAt)

  const registros = await prisma.registroDiario.findMany({
    where:   { userId, data: { gte: dataBase } },
    include: { refeicoes: true },
    orderBy: { data: 'desc' },
  })

  const { streak, dataInicioStreak } = this.calcularStreakRefeicoes(registros, hoje)
  const alvo = Number(meta.valor)

  const ultimoCiclo = await prisma.metaCiclo.findFirst({
    where:   { metaId: meta.id },
    orderBy: { ciclo: 'desc' },
  })

  const toDateStr = (d: Date) => new Date(d).toISOString().split('T')[0]
  const hojeStr   = toDateStr(hoje)

  if (streak === 0) {
    if (ultimoCiclo && !ultimoCiclo.concluidoEm && !ultimoCiclo.quebradoEm) {
      const inicioCicloStr = toDateStr(ultimoCiclo.iniciadoEm)
      const temProgresso   = inicioCicloStr < hojeStr

      if (temProgresso) {
        await prisma.metaCiclo.update({
          where: { id: ultimoCiclo.id },
          data:  { quebradoEm: new Date() },
        })
        await this.abrirNovoCiclo(meta.id, alvo)
      }
    }
    return
  }

  // ── FIX: Ciclo concluído mas streak < alvo ───────────────────────────────
  if (ultimoCiclo?.concluidoEm && streak < alvo) {
    const concluidoStr     = toDateStr(ultimoCiclo.concluidoEm)
    const cicloIncluidHoje = concluidoStr >= hojeStr


    if (cicloIncluidHoje) {
      await prisma.metaCiclo.update({
        where: { id: ultimoCiclo.id },
        data:  { concluidoEm: null, iniciadoEm: dataInicioStreak },
      })
    }
    return
  }

  if (ultimoCiclo?.concluidoEm && streak >= alvo) {
    return
  }

  // ── Garante ciclo aberto ─────────────────────────────────────────────────
  const cicloAberto = !ultimoCiclo?.concluidoEm && !ultimoCiclo?.quebradoEm
    ? ultimoCiclo
    : null

  if (!cicloAberto) {
    await this.abrirNovoCiclo(meta.id, alvo, dataInicioStreak)
    return
  }

  // Corrige iniciadoEm se necessário
  const inicioCicloStr = toDateStr(cicloAberto.iniciadoEm)
  const inicioStreakStr = toDateStr(dataInicioStreak)

  if (inicioCicloStr !== inicioStreakStr) {
    await prisma.metaCiclo.update({
      where: { id: cicloAberto.id },
      data:  { iniciadoEm: dataInicioStreak },
    })
  }

  // ── Streak atingiu o alvo → conclui ─────────────────────────────────────
  if (streak >= alvo) {
    const dataConclusa = new Date(dataInicioStreak)
    dataConclusa.setDate(dataConclusa.getDate() + (alvo - 1))


    await prisma.metaCiclo.update({
      where: { id: cicloAberto.id },
      data: {
        iniciadoEm:  dataInicioStreak,
        concluidoEm: dataConclusa,
      },
    })
  }
}


  async verificarCicloTreinosSemana(userId: number) {
  const meta = await prisma.meta.findFirst({
    where: { userId, tipo: 'TREINOS_POR_SEMANA', ativo: true },
  })
  if (!meta) return

  const hoje   = new Date()
  const inicio = inicioDaSemana(hoje)
  const fim    = fimDaSemana(hoje)
  const alvo   = Number(meta.valor)

  const registros = await prisma.registroDiario.findMany({
    where: {
      userId,
      data:            { gte: inicio, lte: fim },
      treinoAtividade: { feito: true },
    },
    select: { id: true, data: true },
  })

  const feitos = registros.length

  const ultimoCiclo = await prisma.metaCiclo.findFirst({
    where:   { metaId: meta.id },
    orderBy: { ciclo: 'desc' },
  })

  const toDateStr  = (d: Date) => new Date(d).toISOString().split('T')[0]
  const inicioStr  = toDateStr(inicio)
  const fimStr     = toDateStr(fim)

  // ── Problema 2: desmarcar treino deve reabrir ciclo concluído desta semana ──
  if (feitos < alvo) {
    if (ultimoCiclo?.concluidoEm && !ultimoCiclo?.quebradoEm) {
      const concluidoStr      = toDateStr(ultimoCiclo.concluidoEm)
      const cicloEstaEstaSemana = concluidoStr >= inicioStr && concluidoStr <= fimStr

      if (cicloEstaEstaSemana) {
        await prisma.metaCiclo.update({
          where: { id: ultimoCiclo.id },
          data:  { concluidoEm: null },
        })
      }
    }
    return
  }

  // ── feitos >= alvo a partir daqui ──────────────────────────────────────────

  // Ciclo já concluído esta semana → nada a fazer
  if (ultimoCiclo?.concluidoEm && !ultimoCiclo?.quebradoEm) {
    const concluidoStr        = toDateStr(ultimoCiclo.concluidoEm)
    const cicloEstaEstaSemana = concluidoStr >= inicioStr && concluidoStr <= fimStr
    if (cicloEstaEstaSemana) return
  }

  // Garante ciclo aberto para esta semana
  let cicloAberto = !ultimoCiclo?.concluidoEm && !ultimoCiclo?.quebradoEm
    ? ultimoCiclo
    : null

  // Problema 1: não cria ciclo novo automaticamente — só abre se não existir
  if (!cicloAberto) {
    cicloAberto = await this.abrirNovoCiclo(meta.id, alvo, this.diaLocal(inicio))
  }

  // Calcula data do último treino da semana
  const dataUltimoTreino = registros
    .map((r) => new Date(r.data))
    .sort((a, b) => b.getTime() - a.getTime())[0]

  // Conclui o ciclo — sem abrir o próximo (só abre na semana que vem)
  await prisma.metaCiclo.update({
    where: { id: cicloAberto.id },
    data: {
      iniciadoEm:  this.diaLocal(inicio),
      concluidoEm: this.diaLocal(dataUltimoTreino),
    },
  })
}


  async verificarEFecharCiclos(userId: number) {
    await Promise.all([
      this.verificarCicloRefeicoes(userId),
      this.verificarCicloTreinosSemana(userId),
    ])
  }

  // ─── Helpers privados ───────────────────────────────────────────────────────

  private async fecharCicloAtivo(metaId: number) {
    const cicloAtivo = await this.getCicloAtivoSoLeitura(metaId)
    if (!cicloAtivo) return

    await prisma.metaCiclo.update({
      where: { id: cicloAtivo.id },
      data:  { concluidoEm: new Date() },
    })
  }

  private async abrirNovoCiclo(metaId: number, valorAlvo: number, iniciadoEm?: Date) {
    const ultimo = await prisma.metaCiclo.findFirst({
      where:   { metaId },
      orderBy: { ciclo: 'desc' },
    })

    return prisma.metaCiclo.create({
      data: {
        metaId,
        ciclo:      (ultimo?.ciclo ?? 0) + 1,
        valorAlvo,
        iniciadoEm: iniciadoEm ?? new Date(),
      },
    })
  }

  private async getCicloAtivoSoLeitura(metaId: number) {
    return prisma.metaCiclo.findFirst({
      where:   { metaId, concluidoEm: null, quebradoEm: null },
      orderBy: { ciclo: 'desc' },
    })
  }

  private async getUltimosCiclos(metaId: number, quantidade = 5) {
    return prisma.metaCiclo.findMany({
      where: {
        metaId,
        OR: [{ concluidoEm: { not: null } }, { quebradoEm: { not: null } }],
      },
      orderBy: { ciclo: 'desc' },
      take:    quantidade,
    })
  }

  private diaLocal(d: Date): Date {
    const r = new Date(d)
    r.setHours(0, 0, 0, 0)
    return r
  }

  private calcularStreakRefeicoes(
    registros: Array<{ data: Date; refeicoes: { feito: boolean }[] }>,
    hoje: Date,
  ): { streak: number; dataInicioStreak: Date } {
    function todasFeitas(refeicoes: { feito: boolean }[]) {
      return refeicoes.length > 0 && refeicoes.every((r) => r.feito)
    }

    let streak           = 0
    let dataInicioStreak = this.diaLocal(hoje)
    const cursor         = this.diaLocal(hoje)

    for (let i = 0; i < 60; i++) {
      const dataStr = cursor.toISOString().split('T')[0]
      const reg     = registros.find(
        (r) => new Date(r.data).toISOString().split('T')[0] === dataStr,
      )

      if (i === 0) {
        if (reg && todasFeitas(reg.refeicoes)) {
          streak++
          dataInicioStreak = new Date(cursor)
        }
      } else {
        if (!reg || !todasFeitas(reg.refeicoes)) break
        streak++
        dataInicioStreak = new Date(cursor)
      }

      cursor.setDate(cursor.getDate() - 1)
    }

    return { streak, dataInicioStreak }
  }

  
  async progressoRefeicoes(userId: number) {
    const hoje = new Date()

    const registroHoje = await prisma.registroDiario.findFirst({
      where:   { userId, data: { gte: inicioDoDia(hoje), lte: fimDoDia(hoje) } },
      include: { refeicoes: true },
    })

    const totalHoje      = registroHoje?.refeicoes.length ?? 0
    const feitasHoje     = registroHoje?.refeicoes.filter((r) => r.feito).length ?? 0
    const percentualHoje = totalHoje > 0 ? Math.round((feitasHoje / totalHoje) * 100) : 0

    const meta = await prisma.meta.findFirst({
      where: { userId, tipo: 'REFEICOES_CONSECUTIVAS', ativo: true },
    })

    const dataBase = meta ? this.diaLocal(meta.createdAt) : new Date(0)

    const registros = await prisma.registroDiario.findMany({
      where:   { userId, data: { gte: dataBase } },
      include: { refeicoes: true },
      orderBy: { data: 'desc' },
    })

    const { streak, dataInicioStreak } = this.calcularStreakRefeicoes(registros, hoje)
    const alvo = meta ? Number(meta.valor) : null

    // ✅ Busca o último  independente do estado (ativo OU concluído)
    const ultimoCiclo = meta
      ? await prisma.metaCiclo.findFirst({
          where:   { metaId: meta.id },
          orderBy: { ciclo: 'desc' },
        })
      : null

    const cicloAtualConcluidoEm = ultimoCiclo?.concluidoEm ?? null

    const cumprida = !!cicloAtualConcluidoEm && !ultimoCiclo?.quebradoEm

    const cicloEstaAberto  = ultimoCiclo && !ultimoCiclo.concluidoEm && !ultimoCiclo.quebradoEm
    const streakDoCiclo = cumprida
      ? (alvo ?? 0)          
      : cicloEstaAberto
        ? streak
        : 0

    const cicloAtual = ultimoCiclo ?? null

    let ultimosCiclos: Awaited<ReturnType<typeof this.getUltimosCiclos>> = []
    if (meta) {
      ultimosCiclos = await this.getUltimosCiclos(meta.id)
    }

    return {
      streak:          streakDoCiclo,
      alvoStreak:      alvo,
      progressoStreak:  alvo ? Math.min(streakDoCiclo / alvo, 1) : null,
      cumprida,
      feitasHoje,
      totalHoje,
      percentualHoje,
      cicloAtual,
      ultimosCiclos,
    }
  }

  async progressoTreinosSemana(userId: number) {
  const hoje   = new Date()
  const inicio = inicioDaSemana(hoje)
  const fim    = fimDaSemana(hoje)

  const registros = await prisma.registroDiario.findMany({
    where: {
      userId,
      data:            { gte: inicio, lte: fim },
      treinoAtividade: { feito: true },
    },
    select: { id: true, data: true },
  })

  const meta   = await prisma.meta.findFirst({
    where: { userId, tipo: 'TREINOS_POR_SEMANA', ativo: true },
  })
  const feitos = registros.length
  const alvo   = meta ? Number(meta.valor) : null

  const ultimoCiclo = meta
    ? await prisma.metaCiclo.findFirst({
        where:   { metaId: meta.id },
        orderBy: { ciclo: 'desc' },
      })
    : null

  const toDateStr   = (d: Date) => new Date(d).toISOString().split('T')[0]
  const inicioStr   = toDateStr(inicio)
  const fimStr      = toDateStr(fim)

  const cicloConcluidoEstaSemana = ultimoCiclo?.concluidoEm
    ? toDateStr(ultimoCiclo.concluidoEm) >= inicioStr &&
      toDateStr(ultimoCiclo.concluidoEm) <= fimStr
    : false

  const cumprida = cicloConcluidoEstaSemana && !ultimoCiclo?.quebradoEm

  let ultimosCiclos: Awaited<ReturnType<typeof this.getUltimosCiclos>> = []
  if (meta) {
    ultimosCiclos = await this.getUltimosCiclos(meta.id)
  }

  return {
    feitos,
    alvo,
    progresso:  alvo ? Math.min(feitos / alvo, 1) : null,
    cumprida,
    diasFeitos: registros.map((r) => r.data),
    cicloAtual: cicloConcluidoEstaSemana ? ultimoCiclo : (
      ultimoCiclo && !ultimoCiclo.concluidoEm && !ultimoCiclo.quebradoEm
        ? ultimoCiclo
        : null
    ),
    ultimosCiclos,
  }
}


  async progressoAgua(userId: number) {
    const hoje = new Date()

    const meta = await prisma.meta.findFirst({
      where: { userId, tipo: 'AGUA_DIARIA', ativo: true },
    })
    const alvo = meta ? Number(meta.valor) : null

    const quatroDiasAtras = new Date(hoje)
    quatroDiasAtras.setDate(quatroDiasAtras.getDate() - 3)
    quatroDiasAtras.setHours(0, 0, 0, 0)

    const registros = await prisma.registroDiario.findMany({
      where:   { userId, data: { gte: quatroDiasAtras } },
      include: { registrosAgua: true },
      orderBy: { data: 'desc' },
    })

    const porDia = [0, 1, 2, 3].map((diasAtras) => {
      const dia = new Date(hoje)
      dia.setDate(dia.getDate() - diasAtras)
      const dataStr = dia.toISOString().split('T')[0]

      const reg   = registros.find((r) => new Date(r.data).toISOString().split('T')[0] === dataStr)
      const total = reg?.registrosAgua.reduce((acc, r) => acc + r.quantidade, 0) ?? 0

      return { data: dataStr, bebeu: total, alvo, cumprida: alvo ? total >= alvo : false }
    })

    const hoje_ = porDia[0]

    return {
      totalHoje: hoje_.bebeu,
      alvo,
      progresso: alvo ? Math.min(hoje_.bebeu / alvo, 1) : null,
      cumprida:  hoje_.cumprida,
      historico: porDia.slice(1),
    }
  }
}
