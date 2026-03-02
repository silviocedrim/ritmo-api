import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from './auth.service'

const authService = new AuthService()

interface RegisterBody {
  name: string
  email: string
  password: string
}

interface LoginBody {
  email: string
  password: string
}

export async function register(req: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
  const { name, email, password } = req.body

  const user = await authService.register(name, email, password)

  return reply.status(201).send({ user })
}

export async function login(req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
  const { email, password } = req.body

  const user = await authService.login(email, password)

  const token = await reply.jwtSign(
    { sub: user.id, name: user.name, email: user.email },
    { expiresIn: '7d' }
  )

  return reply.send({ token, user })
}
