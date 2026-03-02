import { prisma } from '../../../database/prisma'
import { AppError } from '../../../shared/errors/AppError'

export class DivisaoService {
  async create(userId: number, letra: string, nome: string, descricao?: string) {
  const existente = await prisma.divisaoTreino.findFirst({ // 👈 findFirst no lugar de findUnique
    where: {
      userId,
      letra: letra.toUpperCase(),
      ativo: true, // 👈 só bloqueia se estiver ativo
    },
  })

  if (existente) {
    throw new AppError(`Já existe uma divisão com a letra "${letra.toUpperCase()}"`, 409)
  }

  // Se existir um inativo com a mesma letra, reativa ele
  const inativo = await prisma.divisaoTreino.findFirst({
    where: { userId, letra: letra.toUpperCase(), ativo: false },
  })

  if (inativo) {
    return prisma.divisaoTreino.update({
      where: { id: inativo.id },
      data: { nome, descricao, ativo: true },
    })
  }

  return prisma.divisaoTreino.create({
    data: {
      userId,
      letra: letra.toUpperCase(),
      nome,
      descricao,
    },
  })
}

  async findAll(userId: number) {
    return prisma.divisaoTreino.findMany({
      where: { userId, ativo: true },
      orderBy: { letra: 'asc' },
    })
  }

  async findById(userId: number, id: number) {
    const divisao = await prisma.divisaoTreino.findFirst({
      where: { id, userId },
    })

    if (!divisao) {
      throw new AppError('Divisão de treino não encontrada', 404)
    }

    return divisao
  }

  async update(userId: number, id: number, dados: { letra?: string; nome?: string; descricao?: string }) {
    await this.findById(userId, id)

    if (dados.letra) {
      const letraUpper = dados.letra.toUpperCase()

      const conflito = await prisma.divisaoTreino.findUnique({
        where: { userId_letra: { userId, letra: letraUpper } },
      })

      if (conflito && conflito.id !== id) {
        throw new AppError(`Já existe uma divisão com a letra "${letraUpper}"`, 409)
      }

      dados.letra = letraUpper
    }

    return prisma.divisaoTreino.update({
      where: { id },
      data: dados,
    })
  }

  async remove(userId: number, id: number) {
    await this.findById(userId, id)

    await prisma.divisaoTreino.update({
      where: { id },
      data: { ativo: false },
    })
  }
}
