import { FastifyRequest, FastifyReply } from 'fastify'
import { TreinoAtividadeService } from './treino-atividade.service' 

const service = new TreinoAtividadeService()

interface CreateBody {
  registroDiarioId: number
  tipo: 'MUSCULACAO' | 'FUNCIONAL' | 'CROSSFIT' | 'CALISTENIA' | 'OUTRO'
  divisaoTreinoId?: number
  duracaoMinutos?: number
  observacao?: string
  feito?: boolean
}

interface UpdateBody {
  tipo?: 'MUSCULACAO' | 'FUNCIONAL' | 'CROSSFIT' | 'CALISTENIA' | 'OUTRO'
  divisaoTreinoId?: number
  duracaoMinutos?: number
  observacao?: string
}

interface IdParams {
  id: string
}

export async function create(req: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const { registroDiarioId, tipo, divisaoTreinoId, duracaoMinutos, observacao, feito } = req.body

  const treino = await service.create(userId, {
    registroDiarioId,
    tipo,
    divisaoTreinoId,
    duracaoMinutos,
    observacao,
    feito: feito ?? false,
  })

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

  const treino = await service.update(userId, id, req.body)

  return reply.send({ treino })
}

export async function remove(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)

  await service.remove(userId, id)

  return reply.status(204).send()
}