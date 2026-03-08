import { FastifyRequest, FastifyReply } from 'fastify'
import type { $Enums } from '@prisma/client'
import { RefeicaoService } from './refeicao.service'

type TipoRefeicao = $Enums.TipoRefeicao  // ✅

const service = new RefeicaoService()

interface CreateBody {
  registroDiarioId: number
  tipo: TipoRefeicao
}

interface IdParams {
  id: string
}

interface RegistroQuery {
  registroDiarioId: string
}

export async function create(req: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const refeicao = await service.create(userId, req.body)
  return reply.status(201).send({ refeicao })
}

export async function listByRegistro(req: FastifyRequest<{ Querystring: RegistroQuery }>, reply: FastifyReply) {
  const userId = req.user.sub
  const registroDiarioId = Number(req.query.registroDiarioId)
  const refeicoes = await service.listByRegistro(userId, registroDiarioId)
  return reply.send({ refeicoes })
}

export async function toggleFeito(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  const refeicao = await service.toggleFeito(userId, id)
  return reply.send({ refeicao })
}

export async function remove(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  await service.remove(userId, id)
  return reply.status(204).send()
}
