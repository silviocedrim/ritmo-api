import { FastifyRequest, FastifyReply } from 'fastify'
import { DivisaoService } from './divisao.service'

const divisaoService = new DivisaoService()

interface CreateBody {
  letra: string
  nome: string
  descricao?: string
  emoji?: string
  musculos?: string[]
}

interface UpdateBody {
  letra?: string
  nome?: string
  descricao?: string
  emoji?: string
  musculos?: string[]
}

interface IdParams {
  id: string
}

export async function create(req: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const { letra, nome, descricao, emoji, musculos } = req.body

  const divisao = await divisaoService.create(userId, letra, nome, descricao, emoji, musculos)

  return reply.status(201).send({ divisao })
}

export async function findAll(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.sub
  const divisoes = await divisaoService.findAll(userId)
  return reply.send({ divisoes })
}

export async function findById(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  const divisao = await divisaoService.findById(userId, id)
  return reply.send({ divisao })
}

export async function update(req: FastifyRequest<{ Params: IdParams; Body: UpdateBody }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  const divisao = await divisaoService.update(userId, id, req.body)
  return reply.send({ divisao })
}

export async function remove(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)
  await divisaoService.remove(userId, id)
  return reply.status(204).send()
}
