import { FastifyInstance } from 'fastify'
import { authenticate } from '../../../shared/middleware/authenticate'
import { create, update, toggleFeito, remove } from './cardio.controller'

export async function cardioRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.post('/treinos/cardio', create)
  app.put('/treinos/cardio/:id', update)
  app.patch('/treinos/cardio/:id/toggle', toggleFeito)
  app.delete('/treinos/cardio/:id', remove)
}
