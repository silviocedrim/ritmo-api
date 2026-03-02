import { FastifyInstance } from 'fastify'
import { authenticate } from '../../../shared/middleware/authenticate'
import { create, update, remove } from './excecao-alimentar.controller'

export async function excecaoAlimentarRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.post('/nutricao/excecoes', create)
  app.put('/nutricao/excecoes/:id', update)
  app.delete('/nutricao/excecoes/:id', remove)
}
