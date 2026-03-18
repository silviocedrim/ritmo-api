import { FastifyInstance } from 'fastify'
import { getProfile, updateProfile, uploadAvatar } from './user.controller'

export async function userRoutes(app: FastifyInstance) {
  // Todas protegidas por JWT
  app.addHook('onRequest', async (req, reply) => {
    await req.jwtVerify()
  })

  app.get('/user/profile', getProfile)
  app.put('/user/profile', updateProfile)
  app.patch('/user/avatar', uploadAvatar)
}
