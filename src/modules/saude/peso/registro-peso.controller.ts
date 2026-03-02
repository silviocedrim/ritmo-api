import { FastifyRequest, FastifyReply } from 'fastify'
import { RegistroPesoService } from './registro-peso.service'

const service = new RegistroPesoService()

interface CreateBody {
  registroDiarioId: number
  peso: number
}

interface UpdateBody {
  peso: number
}

interface IdParams {
  id: string
}

export async function create(req: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const registro = await service.create(userId, req.body)
  return reply.status(201).send({ registro })
}

export async function update(req: FastifyRequest<{ Params: IdParams; Body: UpdateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  const registro = await service.update(userId, id, req.body)
  return reply.send({ registro })
}

export async function remove(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  await service.remove(userId, id)
  return reply.status(204).send()
}

export async function historico(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.sub
  const registros = await service.historico(userId)
  return reply.send({ registros })
}
