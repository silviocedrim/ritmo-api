import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { prisma } from './database/prisma'
import { AppError } from './shared/errors/AppError'
import { authRoutes } from './modules/auth/auth.routes'
import { divisoesRoutes } from './modules/treino/divisao/divisao.routes'
import { registroDiarioRoutes } from './modules/registro-dario/registro-diario.routes' 
import { treinoAtividadeRoutes } from './modules/treino/musculacao/treino-atividade.routes'
import { cardioRoutes } from './modules/treino/cardio/cardio.routes'
import { refeicaoRoutes } from './modules/nutricao/refeicao/refeicao.routes'
import { excecaoAlimentarRoutes } from './modules/nutricao/excessao-alimentar/excecao-alimentar.routes' 
import { registroPesoRoutes } from './modules/saude/peso/registro-peso.routes'
import { registroAguaRoutes } from './modules/saude/agua/registro-agua.routes'
import { metaRoutes } from './modules/meta/meta.routes' 
import { tipoRefeicaoRoutes } from './modules/nutricao/tipo-refeicao/tipo-refeicao.routes'
import { userRoutes } from './modules/user/user.routes'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import path from 'node:path'


export const app = Fastify({ logger: false })

const start = async () => {
  try {
    // Conecta ao banco com retry
    let retries = 5
    while (retries > 0) {
      try {
        await prisma.$connect()
        console.log('✅ Banco conectado!')
        break
      } catch (err) {
        retries--
        console.log(`⚠️ Banco indisponível, tentando novamente... (${retries} tentativas restantes)`)
        if (retries === 0) throw err
        await new Promise(res => setTimeout(res, 3000))
      }
    }

    await app.register(cors, { origin: '*' })

    await app.register(jwt, {
      secret: process.env.JWT_SECRET!,
    })

    app.register(multipart, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })
    app.register(fastifyStatic, {
      root: path.join(process.cwd(), 'uploads'),
      prefix: '/uploads/', 
    })

    // Rotas
    await app.register(authRoutes)
    await app.register(divisoesRoutes)
    await app.register(registroDiarioRoutes)
    await app.register(treinoAtividadeRoutes)
    await app.register(cardioRoutes)
    await app.register(refeicaoRoutes)
    await app.register(excecaoAlimentarRoutes)
    await app.register(registroPesoRoutes)
    await app.register(registroAguaRoutes)
    await app.register(metaRoutes)
    await app.register(tipoRefeicaoRoutes)
    await app.register(userRoutes)
    // await app.register(multipart)

    app.get('/health', async () => {
      return { status: 'ok', message: 'Vida Fitness API rodando!' }
    })

    app.setErrorHandler((error, _, reply) => {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ message: error.message })
      }

      console.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    })

    const port = Number(process.env.PORT) || 3333
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Servidor rodando na porta ${port}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
