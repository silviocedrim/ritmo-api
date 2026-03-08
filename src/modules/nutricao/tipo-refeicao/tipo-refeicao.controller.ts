import { FastifyRequest, FastifyReply } from 'fastify'
import { TipoRefeicaoService } from './tipo-refeicao.service'

const service = new TipoRefeicaoService()

interface CreateBody {
  nome: string
  emoji?: string
  horario?: string
  ordem?: number
}

interface UpdateBody {
  nome?: string
  emoji?: string
  horario?: string
  ordem?: number
  ativo?: boolean
}

interface IdParams {
  id: string
}

export async function create(req: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const tipo = await service.create(userId, req.body)
  return reply.status(201).send({ tipo })
}

export async function list(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.sub
  const tipos = await service.list(userId)
  return reply.send({ tipos })
}

export async function listAtivos(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.sub
  const tipos = await service.listAtivos(userId)
  return reply.send({ tipos })
}

export async function update(
  req: FastifyRequest<{ Params: IdParams; Body: UpdateBody }>,
  reply: FastifyReply,
) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  const tipo = await service.update(userId, id, req.body)
  return reply.send({ tipo })
}

export async function remove(
  req: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  await service.remove(userId, id)
  return reply.status(204).send()
}
