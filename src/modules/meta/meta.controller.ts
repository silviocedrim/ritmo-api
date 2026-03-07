import { FastifyRequest, FastifyReply } from 'fastify'
import { TipoMeta } from '@prisma/client'
import { MetaService } from './meta.service'

const service = new MetaService()

interface CreateBody {
  tipo: TipoMeta
  valor: number
  dataAlvo?: string
}

interface UpdateBody {
  valor?: number
  dataAlvo?: string
  ativo?: boolean
}

interface IdParams {
  id: string
}

export async function create(req: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const { tipo, valor, dataAlvo } = req.body

  const meta = await service.create(userId, {
    tipo,
    valor,
    dataAlvo: dataAlvo ? new Date(dataAlvo) : undefined,
  })

  return reply.status(201).send({ meta })
}

export async function list(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.sub
  const metas = await service.list(userId)
  return reply.send({ metas })
}

export async function listAtivas(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.sub
  const metas = await service.listAtivas(userId)
  return reply.send({ metas })
}

export async function update(req: FastifyRequest<{ Params: IdParams; Body: UpdateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  const { valor, dataAlvo, ativo } = req.body

  const meta = await service.update(userId, id, {
    valor,
    ativo,
    dataAlvo: dataAlvo ? new Date(dataAlvo) : undefined,
  })

  return reply.send({ meta })
}

export async function remove(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  await service.remove(userId, id)
  return reply.status(204).send()
}

export async function progressoTreinosSemana(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.sub
  const data = await service.progressoTreinosSemana(userId)
  return reply.send(data)
}

export async function progressoRefeicoes(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.sub
  const data = await service.progressoRefeicoes(userId)
  return reply.send(data)
}
