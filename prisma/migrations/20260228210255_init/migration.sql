-- CreateEnum
CREATE TYPE "TipoRefeicao" AS ENUM ('CAFE_DA_MANHA', 'ALMOCO', 'JANTAR', 'LANCHE_CEIA');

-- CreateEnum
CREATE TYPE "TipoMeta" AS ENUM ('TREINOS_POR_SEMANA', 'REFEICOES_CONSECUTIVAS', 'AGUA_DIARIA', 'PESO_ALVO');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisoes_treino" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "letra" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "divisoes_treino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_diarios" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "data" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_diarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treinos_musculacao" (
    "id" SERIAL NOT NULL,
    "registroDiarioId" INTEGER NOT NULL,
    "divisaoTreinoId" INTEGER NOT NULL,
    "feito" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treinos_musculacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treinos_cardio" (
    "id" SERIAL NOT NULL,
    "registroDiarioId" INTEGER NOT NULL,
    "feito" BOOLEAN NOT NULL DEFAULT false,
    "tipo" TEXT,
    "duracaoMinutos" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treinos_cardio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refeicoes" (
    "id" SERIAL NOT NULL,
    "registroDiarioId" INTEGER NOT NULL,
    "tipo" "TipoRefeicao" NOT NULL,
    "feito" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refeicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "excecoes_alimentares" (
    "id" SERIAL NOT NULL,
    "registroDiarioId" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "excecoes_alimentares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_agua" (
    "id" SERIAL NOT NULL,
    "registroDiarioId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_agua_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_peso" (
    "id" SERIAL NOT NULL,
    "registroDiarioId" INTEGER NOT NULL,
    "peso" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_peso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metas" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tipo" "TipoMeta" NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "dataAlvo" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "divisoes_treino_userId_letra_key" ON "divisoes_treino"("userId", "letra");

-- CreateIndex
CREATE UNIQUE INDEX "registros_diarios_userId_data_key" ON "registros_diarios"("userId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "treinos_musculacao_registroDiarioId_key" ON "treinos_musculacao"("registroDiarioId");

-- CreateIndex
CREATE UNIQUE INDEX "treinos_cardio_registroDiarioId_key" ON "treinos_cardio"("registroDiarioId");

-- CreateIndex
CREATE UNIQUE INDEX "refeicoes_registroDiarioId_tipo_key" ON "refeicoes"("registroDiarioId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "excecoes_alimentares_registroDiarioId_key" ON "excecoes_alimentares"("registroDiarioId");

-- CreateIndex
CREATE UNIQUE INDEX "registros_peso_registroDiarioId_key" ON "registros_peso"("registroDiarioId");

-- AddForeignKey
ALTER TABLE "divisoes_treino" ADD CONSTRAINT "divisoes_treino_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_diarios" ADD CONSTRAINT "registros_diarios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinos_musculacao" ADD CONSTRAINT "treinos_musculacao_registroDiarioId_fkey" FOREIGN KEY ("registroDiarioId") REFERENCES "registros_diarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinos_musculacao" ADD CONSTRAINT "treinos_musculacao_divisaoTreinoId_fkey" FOREIGN KEY ("divisaoTreinoId") REFERENCES "divisoes_treino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinos_cardio" ADD CONSTRAINT "treinos_cardio_registroDiarioId_fkey" FOREIGN KEY ("registroDiarioId") REFERENCES "registros_diarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refeicoes" ADD CONSTRAINT "refeicoes_registroDiarioId_fkey" FOREIGN KEY ("registroDiarioId") REFERENCES "registros_diarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excecoes_alimentares" ADD CONSTRAINT "excecoes_alimentares_registroDiarioId_fkey" FOREIGN KEY ("registroDiarioId") REFERENCES "registros_diarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_agua" ADD CONSTRAINT "registros_agua_registroDiarioId_fkey" FOREIGN KEY ("registroDiarioId") REFERENCES "registros_diarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_peso" ADD CONSTRAINT "registros_peso_registroDiarioId_fkey" FOREIGN KEY ("registroDiarioId") REFERENCES "registros_diarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
