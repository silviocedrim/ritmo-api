import { FastifyInstance } from 'fastify'
import { authenticate } from '../../../shared/middleware/authenticate'
import { create, findAll, findById, update, remove } from './divisao.controller'

export async function divisoesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.post('/treinos/divisoes', create)
  app.get('/treinos/divisoes', findAll)
  app.get('/treinos/divisoes/:id', findById)
  app.put('/treinos/divisoes/:id', update)
  app.delete('/treinos/divisoes/:id', remove)
}
