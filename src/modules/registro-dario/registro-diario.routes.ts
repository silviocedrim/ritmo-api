import { FastifyInstance } from 'fastify'
import { authenticate } from '../../shared/middleware/authenticate'
import { findOrCreate, findAll, findById, remove, findByData } from './registro-diario.controller'

export async function registroDiarioRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.get('/registros', findAll)
  app.get('/registros/:id', findById)
  app.get('/registros/by-date/:data', findByData)
  app.post('/registros/:data', findOrCreate)  // ex: /registros/2026-03-02
  app.delete('/registros/:id', remove)
}
