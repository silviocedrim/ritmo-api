import { FastifyInstance } from 'fastify'
import { authenticate } from '../../../shared/middleware/authenticate'
import { create, toggleFeito, update, remove } from './treino-atividade.controller'

export async function treinoAtividadeRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.post('/treinos/atividade', create)
  app.patch('/treinos/atividade/:id/toggle', toggleFeito)
  app.put('/treinos/atividade/:id', update)
  app.delete('/treinos/atividade/:id', remove)
}
