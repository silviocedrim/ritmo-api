import { FastifyRequest, FastifyReply } from 'fastify'
import { CardioService } from './cardio.service'

const service = new CardioService()

interface CreateBody {
  registroDiarioId: number
  tipo?: string
  duracaoMinutos?: number
}

interface UpdateBody {
  tipo?: string
  duracaoMinutos?: number
}

interface IdParams {
  id: string
}

export async function create(req: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const treino = await service.create(userId, req.body)
  return reply.status(201).send({ treino })
}

export async function update(req: FastifyRequest<{ Params: IdParams; Body: UpdateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  const treino = await service.update(userId, id, req.body)
  return reply.send({ treino })
}

export async function toggleFeito(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  const treino = await service.toggleFeito(userId, id)
  return reply.send({ treino })
}

export async function remove(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  await service.remove(userId, id)
  return reply.status(204).send()
}
