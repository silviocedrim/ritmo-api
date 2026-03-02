import { FastifyInstance } from 'fastify'
import { authenticate } from '../../shared/middleware/authenticate'
import { create, list, listAtivas, update, remove } from './meta.controller'

export async function metaRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.post('/metas', create)
  app.get('/metas', list)
  app.get('/metas/ativas', listAtivas)
  app.put('/metas/:id', update)
  app.delete('/metas/:id', remove)
}
