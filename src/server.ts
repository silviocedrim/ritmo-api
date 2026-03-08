import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { AppError } from './shared/errors/AppError'
import { authRoutes } from './modules/auth/auth.routes'
import { divisoesRoutes } from './modules/treino/divisao/divisao.routes'
import { registroDiarioRoutes } from './modules/registro-dario/registro-diario.routes' 
import { treinoMusculacaoRoutes } from './modules/treino/musculacao/treino-musculacao.routes'
import { cardioRoutes } from './modules/treino/cardio/cardio.routes'
import { refeicaoRoutes } from './modules/nutricao/refeicao/refeicao.routes'
import { excecaoAlimentarRoutes } from './modules/nutricao/excessao-alimentar/excecao-alimentar.routes' 
import { registroPesoRoutes } from './modules/saude/peso/registro-peso.routes'
import { registroAguaRoutes } from './modules/saude/agua/registro-agua.routes'
import { metaRoutes } from './modules/meta/meta.routes' 
import { tipoRefeicaoRoutes } from './modules/nutricao/tipo-refeicao/tipo-refeicao.routes'

export const app = Fastify({ logger: false })

const start = async () => {
  try {
    await app.register(cors, { origin: '*' })

    await app.register(jwt, {
      secret: process.env.JWT_SECRET!,
    })

    // Rotas
    await app.register(authRoutes)
    await app.register(divisoesRoutes)
    await app.register(registroDiarioRoutes)
    await app.register(treinoMusculacaoRoutes)
    await app.register(cardioRoutes)
    await app.register(refeicaoRoutes)
    await app.register(excecaoAlimentarRoutes)
    await app.register(registroPesoRoutes)
    await app.register(registroAguaRoutes)
    await app.register(metaRoutes)
    await app.register(tipoRefeicaoRoutes)

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
