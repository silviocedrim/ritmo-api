import { prisma } from '../../database/prisma' 
import { AppError } from '../../shared/errors/AppError'

export class RegistroDiarioService {

  async findOrCreate(userId: number, data: Date) {
    const existing = await prisma.registroDiario.findUnique({
      where: { userId_data: { userId, data } },
      include: this.defaultInclude(),
    })

    if (existing) return existing

    return prisma.registroDiario.create({
      data: { userId, data },
      include: this.defaultInclude(),
    })
  }

  async findAll(userId: number) {
    return prisma.registroDiario.findMany({
      where: { userId },
      orderBy: { data: 'desc' },
      include: this.defaultInclude(),
    })
  }

  async findById(userId: number, id: number) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id, userId },
      include: this.defaultInclude(),
    })

    if (!registro) throw new AppError('Registro não encontrado', 404)

    return registro
  }

  async findByData(userId: number, data: Date) {
    const registro = await prisma.registroDiario.findUnique({
      where: { userId_data: { userId, data } },
      include: this.defaultInclude(),
    })

    if (!registro) throw new AppError('Registro não encontrado para essa data', 404)

    return registro
  }

  async remove(userId: number, id: number) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id, userId },
    })

    if (!registro) throw new AppError('Registro não encontrado', 404)

    await prisma.registroDiario.delete({ where: { id } })
  }

  private defaultInclude() {
    return {
      treinoMusculacao: true,
      treinoCardio: true,
      refeicoes: true,
      excecaoAlimentar: true,
      registrosAgua: true,
      registroPeso: true,
    }
  }
}
