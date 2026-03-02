import { FastifyInstance } from 'fastify'
import { authenticate } from '../../../shared/middleware/authenticate'
import { create, listByRegistro, toggleFeito, remove } from './refeicao.controller'

export async function refeicaoRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.post('/nutricao/refeicoes', create)
  app.get('/nutricao/refeicoes', listByRegistro)           // ?registroDiarioId=1
  app.patch('/nutricao/refeicoes/:id/toggle', toggleFeito)
  app.delete('/nutricao/refeicoes/:id', remove)
}
