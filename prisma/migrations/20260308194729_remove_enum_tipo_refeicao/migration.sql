/*
  Warnings:

  - You are about to drop the column `emoji` on the `divisoes_treino` table. All the data in the column will be lost.
  - You are about to drop the column `musculos` on the `divisoes_treino` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `refeicoes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registroDiarioId,configTipoRefeicaoId]` on the table `refeicoes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `configTipoRefeicaoId` to the `refeicoes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "refeicoes_registroDiarioId_tipo_key";

-- AlterTable
ALTER TABLE "divisoes_treino" DROP COLUMN "emoji",
DROP COLUMN "musculos";

-- AlterTable
ALTER TABLE "refeicoes" DROP COLUMN "tipo",
ADD COLUMN     "configTipoRefeicaoId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "TipoRefeicao";

-- CreateTable
CREATE TABLE "config_tipos_refeicao" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "emoji" TEXT,
    "horario" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_tipos_refeicao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "config_tipos_refeicao_userId_nome_key" ON "config_tipos_refeicao"("userId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "refeicoes_registroDiarioId_configTipoRefeicaoId_key" ON "refeicoes"("registroDiarioId", "configTipoRefeicaoId");

-- AddForeignKey
ALTER TABLE "config_tipos_refeicao" ADD CONSTRAINT "config_tipos_refeicao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refeicoes" ADD CONSTRAINT "refeicoes_configTipoRefeicaoId_fkey" FOREIGN KEY ("configTipoRefeicaoId") REFERENCES "config_tipos_refeicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
