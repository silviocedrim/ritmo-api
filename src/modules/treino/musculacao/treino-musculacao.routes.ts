import { FastifyInstance } from 'fastify'
import { authenticate } from '../../../shared/middleware/authenticate' 
import { create, toggleFeito, update, remove } from './treino-musculacao.controller'

export async function treinoMusculacaoRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.post('/treinos/musculacao', create)
  app.patch('/treinos/musculacao/:id/toggle', toggleFeito)  // 👈 marca/desmarca feito
  app.put('/treinos/musculacao/:id', update)
  app.delete('/treinos/musculacao/:id', remove)
}
