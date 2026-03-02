import { FastifyInstance } from 'fastify'
import { authenticate } from '../../../shared/middleware/authenticate'
import { create, update, remove, historico } from './registro-peso.controller'

export async function registroPesoRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.post('/saude/peso', create)
  app.put('/saude/peso/:id', update)
  app.delete('/saude/peso/:id', remove)
  app.get('/saude/peso/historico', historico)
}
