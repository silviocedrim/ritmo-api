/*
  Warnings:

  - You are about to drop the `treinos_musculacao` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoAtividade" AS ENUM ('MUSCULACAO', 'FUNCIONAL', 'CROSSFIT', 'CALISTENIA', 'OUTRO');

-- DropForeignKey
ALTER TABLE "treinos_musculacao" DROP CONSTRAINT "treinos_musculacao_divisaoTreinoId_fkey";

-- DropForeignKey
ALTER TABLE "treinos_musculacao" DROP CONSTRAINT "treinos_musculacao_registroDiarioId_fkey";

-- DropTable
DROP TABLE "treinos_musculacao";

-- CreateTable
CREATE TABLE "treinos_atividade" (
    "id" SERIAL NOT NULL,
    "registroDiarioId" INTEGER NOT NULL,
    "tipo" "TipoAtividade" NOT NULL,
    "divisaoTreinoId" INTEGER,
    "duracaoMinutos" INTEGER,
    "observacao" TEXT,
    "feito" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treinos_atividade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "treinos_atividade_registroDiarioId_key" ON "treinos_atividade"("registroDiarioId");

-- AddForeignKey
ALTER TABLE "treinos_atividade" ADD CONSTRAINT "treinos_atividade_registroDiarioId_fkey" FOREIGN KEY ("registroDiarioId") REFERENCES "registros_diarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinos_atividade" ADD CONSTRAINT "treinos_atividade_divisaoTreinoId_fkey" FOREIGN KEY ("divisaoTreinoId") REFERENCES "divisoes_treino"("id") ON DELETE SET NULL ON UPDATE CASCADE;
