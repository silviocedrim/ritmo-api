import { FastifyInstance } from 'fastify'
import { authenticate } from '../../../shared/middleware/authenticate'
import { create, list, listAtivos, update, remove } from './tipo-refeicao.controller'

export async function tipoRefeicaoRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.post('/nutricao/tipos-refeicao', create)
  app.get('/nutricao/tipos-refeicao', list)
  app.get('/nutricao/tipos-refeicao/ativos', listAtivos)
  app.patch('/nutricao/tipos-refeicao/:id', update)
  app.delete('/nutricao/tipos-refeicao/:id', remove)
}
