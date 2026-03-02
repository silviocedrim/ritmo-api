import { prisma } from '../../../database/prisma' 
import { AppError } from '../../../shared/errors/AppError'

interface CreateRegistroAguaDTO {
  registroDiarioId: number
  quantidade: number
}

export class RegistroAguaService {

  async create(userId: number, data: CreateRegistroAguaDTO) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id: data.registroDiarioId, userId },
    })

    if (!registro) throw new AppError('Registro diário não encontrado', 404)

    return prisma.registroAgua.create({
      data: {
        registroDiarioId: data.registroDiarioId,
        quantidade: data.quantidade,
      },
    })
  }

  async listByRegistro(userId: number, registroDiarioId: number) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id: registroDiarioId, userId },
    })

    if (!registro) throw new AppError('Registro diário não encontrado', 404)

    const registros = await prisma.registroAgua.findMany({
      where: { registroDiarioId },
      orderBy: { hora: 'asc' },
    })

    const totalMl = registros.reduce((acc, r) => acc + r.quantidade, 0)

    return { registros, totalMl }
  }

  async remove(userId: number, id: number) {
    const registroAgua = await prisma.registroAgua.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!registroAgua) throw new AppError('Registro de água não encontrado', 404)

    await prisma.registroAgua.delete({ where: { id } })
  }
}
