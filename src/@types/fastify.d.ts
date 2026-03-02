import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: number
      name: string
      email: string
    }
    user: {
      sub: number
      name: string
      email: string
    }
  }
}
