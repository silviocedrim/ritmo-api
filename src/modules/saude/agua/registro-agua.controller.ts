import { FastifyRequest, FastifyReply } from 'fastify'
import { RegistroAguaService } from './registro-agua.service'

const service = new RegistroAguaService()

interface CreateBody {
  registroDiarioId: number
  quantidade: number
}

interface IdParams {
  id: string
}

interface RegistroQuery {
  registroDiarioId: string
}

export async function create(req: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const registro = await service.create(userId, req.body)
  return reply.status(201).send({ registro })
}

export async function listByRegistro(req: FastifyRequest<{ Querystring: RegistroQuery }>, reply: FastifyReply) {
  const userId = req.user.sub
  const registroDiarioId = Number(req.query.registroDiarioId)
  const data = await service.listByRegistro(userId, registroDiarioId)
  return reply.send(data)
}

export async function remove(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  await service.remove(userId, id)
  return reply.status(204).send()
}
