import { FastifyRequest, FastifyReply } from 'fastify'
import { RegistroDiarioService } from './registro-diario.service'

const service = new RegistroDiarioService()

interface DataParams {
  data: string // YYYY-MM-DD
}

interface IdParams {
  id: string
}

export async function findOrCreate(req: FastifyRequest<{ Params: DataParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const data = new Date(req.params.data)

  const registro = await service.findOrCreate(userId, data)

  return reply.status(200).send({ registro })
}

export async function findAll(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.sub

  const registros = await service.findAll(userId)

  return reply.send({ registros })
}

export async function findById(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)

  const registro = await service.findById(userId, id)

  return reply.send({ registro })
}

export async function remove(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) {
  const userId = req.user.sub
  const id = Number(req.params.id)

  await service.remove(userId, id)

  return reply.status(204).send()
}
