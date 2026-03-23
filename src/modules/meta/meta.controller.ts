import { FastifyRequest, FastifyReply } from 'fastify'
import { MetaService } from './meta.service'
import type { $Enums } from '@prisma/client'
type TipoMeta = $Enums.TipoMeta

const service = new MetaService()

interface CreateBody  { tipo: TipoMeta; valor: number; dataAlvo?: string }
interface UpdateBody  { valor?: number; dataAlvo?: string; ativo?: boolean }
interface IdParams    { id: string }

export async function create(req: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const { tipo, valor, dataAlvo } = req.body
  const meta = await service.upsert(userId, { 
    tipo,
    valor,
    dataAlvo: dataAlvo ? new Date(dataAlvo) : undefined,
  })
  return reply.status(201).send({ meta })
}

export async function list(req: FastifyRequest, reply: FastifyReply) {
  const metas = await service.list(req.user.sub)
  return reply.send({ metas })
}

export async function listAtivas(req: FastifyRequest, reply: FastifyReply) {
  const metas = await service.listAtivas(req.user.sub)
  return reply.send({ metas })
}

export async function update(
  req: FastifyRequest<{ Params: IdParams; Body: UpdateBody }>,
  reply: FastifyReply,
) {
  const userId = req.user.sub
  const id     = Number(req.params.id)
  const { valor, dataAlvo, ativo } = req.body
  const meta = await service.update(userId, id, {
    valor,
    ativo,
    dataAlvo: dataAlvo ? new Date(dataAlvo) : undefined,
  })
  return reply.send({ meta })
}

export async function remove(
  req: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  await service.remove(req.user.sub, Number(req.params.id))
  return reply.status(204).send()
}

export async function progressoTreinosSemana(req: FastifyRequest, reply: FastifyReply) {
  const data = await service.progressoTreinosSemana(req.user.sub)
  return reply.send(data)
}

export async function progressoRefeicoes(req: FastifyRequest, reply: FastifyReply) {
  const data = await service.progressoRefeicoes(req.user.sub)
  return reply.send(data)
}

export async function progressoAgua(req: FastifyRequest, reply: FastifyReply) {
  const data = await service.progressoAgua(req.user.sub)
  return reply.send(data)
}

export async function verificarRefeicoes(req: FastifyRequest, reply: FastifyReply) {
  await service.verificarCicloRefeicoes(req.user.sub)
  return reply.status(204).send()
}

export async function verificarTreinos(req: FastifyRequest, reply: FastifyReply) {
  await service.verificarCicloTreinosSemana(req.user.sub)
  return reply.status(204).send()
}
