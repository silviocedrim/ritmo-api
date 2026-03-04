-- AlterTable
ALTER TABLE "divisoes_treino" ADD COLUMN     "emoji" TEXT NOT NULL DEFAULT '💪',
ADD COLUMN     "musculos" TEXT[] DEFAULT ARRAY[]::TEXT[];
