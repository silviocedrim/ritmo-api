import { prisma } from '../../../database/prisma' 
import { AppError } from '../../../shared/errors/AppError'

interface CreateRegistroPesoDTO {
  registroDiarioId: number
  peso: number
}

interface UpdateRegistroPesoDTO {
  peso: number
}

export class RegistroPesoService {

  async create(userId: number, data: CreateRegistroPesoDTO) {
    const registro = await prisma.registroDiario.findFirst({
      where: { id: data.registroDiarioId, userId },
    })

    if (!registro) throw new AppError('Registro diário não encontrado', 404)

    const existente = await prisma.registroPeso.findUnique({
      where: { registroDiarioId: data.registroDiarioId },
    })

    if (existente) throw new AppError('Já existe um registro de peso para esse dia', 409)

    return prisma.registroPeso.create({
      data: {
        registroDiarioId: data.registroDiarioId,
        peso: data.peso,
      },
    })
  }

  async update(userId: number, id: number, data: UpdateRegistroPesoDTO) {
    const registroPeso = await prisma.registroPeso.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!registroPeso) throw new AppError('Registro de peso não encontrado', 404)

    return prisma.registroPeso.update({
      where: { id },
      data: { peso: data.peso },
    })
  }

  async remove(userId: number, id: number) {
    const registroPeso = await prisma.registroPeso.findFirst({
      where: { id, registroDiario: { userId } },
    })

    if (!registroPeso) throw new AppError('Registro de peso não encontrado', 404)

    await prisma.registroPeso.delete({ where: { id } })
  }

  async historico(userId: number) {
    return prisma.registroPeso.findMany({
      where: { registroDiario: { userId } },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        peso: true,
        createdAt: true,
        registroDiario: {
          select: { data: true },
        },
      },
    })
  }
}
