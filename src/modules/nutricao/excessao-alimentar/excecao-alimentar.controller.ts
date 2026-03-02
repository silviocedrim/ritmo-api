import { FastifyRequest, FastifyReply } from 'fastify'
import { ExcecaoAlimentarService } from './excecao-alimentar.service'

const service = new ExcecaoAlimentarService()

interface CreateBody {
  registroDiarioId: number
  descricao: string
}

interface UpdateBody {
  descricao: string
}

interface IdParams {
  id: string
}

export async function create(req: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const excecao = await service.create(userId, req.body)
  return reply.status(201).send({ excecao })
}

export async function update(req: FastifyRequest<{ Params: IdParams; Body: UpdateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  const excecao = await service.update(userId, id, req.body)
  return reply.send({ excecao })
}

export async function remove(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  await service.remove(userId, id)
  return reply.status(204).send()
}
