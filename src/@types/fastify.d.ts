// src/@types/fastify.d.ts
import '@fastify/jwt'
import { MultipartFile } from '@fastify/multipart'

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

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      sub: number  // ✅ era string, mas no JWT está number — padronize aqui
      name: string
      email: string
    }
  }
}
