import { FastifyRequest, FastifyReply } from 'fastify'
import { TreinoMusculacaoService } from './treino-musculacao.service'

const service = new TreinoMusculacaoService()

interface CreateBody {
  registroDiarioId: number
  divisaoTreinoId: number
  feito?: boolean
}

interface UpdateBody {
  divisaoTreinoId: number
}

interface IdParams {
  id: string
}

export async function create(req: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const { registroDiarioId, divisaoTreinoId, feito } = req.body

  const treino = await service.create(userId, registroDiarioId, divisaoTreinoId, feito ?? false)

  return reply.status(201).send({ treino })
}

export async function toggleFeito(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)

  const treino = await service.toggleFeito(userId, id)

  return reply.send({ treino })
}

export async function update(req: FastifyRequest<{ Params: IdParams; Body: UpdateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  const { divisaoTreinoId } = req.body

  const treino = await service.update(userId, id, divisaoTreinoId)

  return reply.send({ treino })
}

export async function remove(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)

  await service.remove(userId, id)

  return reply.status(204).send()
}
