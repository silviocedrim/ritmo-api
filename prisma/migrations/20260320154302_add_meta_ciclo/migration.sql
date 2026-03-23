-- CreateTable
CREATE TABLE "meta_ciclos" (
    "id" SERIAL NOT NULL,
    "metaId" INTEGER NOT NULL,
    "ciclo" INTEGER NOT NULL,
    "iniciadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidoEm" TIMESTAMP(3),
    "quebradoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meta_ciclos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meta_ciclos_metaId_ciclo_key" ON "meta_ciclos"("metaId", "ciclo");

-- AddForeignKey
ALTER TABLE "meta_ciclos" ADD CONSTRAINT "meta_ciclos_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "metas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
