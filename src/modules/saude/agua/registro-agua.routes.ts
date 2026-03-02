import { FastifyInstance } from 'fastify'
import { authenticate } from '../../../shared/middleware/authenticate'
import { create, listByRegistro, remove } from './registro-agua.controller'

export async function registroAguaRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.post('/saude/agua', create)
  app.get('/saude/agua', listByRegistro)       // ?registroDiarioId=1
  app.delete('/saude/agua/:id', remove)
}
