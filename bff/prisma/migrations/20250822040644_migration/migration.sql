-- CreateEnum
CREATE TYPE "Timeframe" AS ENUM ('D1', 'H4', 'H1', 'M15', 'M5');

-- CreateEnum
CREATE TYPE "PivotType" AS ENUM ('HIGH', 'LOW');

-- CreateEnum
CREATE TYPE "LineType" AS ENUM ('SUPPORT', 'RESIST', 'CHANNEL');

-- CreateEnum
CREATE TYPE "FeedbackLabel" AS ENUM ('GOOD', 'BAD');

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timeframe" "Timeframe" NOT NULL,
    "sourceFile" TEXT,
    "rows" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candle" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "time" TIMESTAMPTZ(6) NOT NULL,
    "tIdx" INTEGER NOT NULL,
    "open" DECIMAL(20,8) NOT NULL,
    "high" DECIMAL(20,8) NOT NULL,
    "low" DECIMAL(20,8) NOT NULL,
    "close" DECIMAL(20,8) NOT NULL,

    CONSTRAINT "Candle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pivot" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "tIdx" INTEGER NOT NULL,
    "price" DECIMAL(20,8) NOT NULL,
    "type" "PivotType" NOT NULL,
    "scale" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Pivot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineCandidate" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "type" "LineType" NOT NULL,
    "m" DOUBLE PRECISION NOT NULL,
    "b" DOUBLE PRECISION NOT NULL,
    "tStart" INTEGER NOT NULL,
    "tEnd" INTEGER NOT NULL,
    "features" JSONB NOT NULL,

    CONSTRAINT "LineCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineScore" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "label" "FeedbackLabel" NOT NULL,
    "adjustedM" DOUBLE PRECISION,
    "adjustedB" DOUBLE PRECISION,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelVersion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "params" JSONB,
    "trainRange" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dataset_symbol_timeframe_idx" ON "Dataset"("symbol", "timeframe");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_symbol_timeframe_key" ON "Dataset"("symbol", "timeframe");

-- CreateIndex
CREATE INDEX "Candle_datasetId_tIdx_idx" ON "Candle"("datasetId", "tIdx");

-- CreateIndex
CREATE INDEX "Candle_datasetId_time_idx" ON "Candle"("datasetId", "time");

-- CreateIndex
CREATE UNIQUE INDEX "Candle_datasetId_time_key" ON "Candle"("datasetId", "time");

-- CreateIndex
CREATE INDEX "Pivot_datasetId_tIdx_idx" ON "Pivot"("datasetId", "tIdx");

-- CreateIndex
CREATE INDEX "Pivot_datasetId_type_idx" ON "Pivot"("datasetId", "type");

-- CreateIndex
CREATE INDEX "LineCandidate_datasetId_type_idx" ON "LineCandidate"("datasetId", "type");

-- CreateIndex
CREATE INDEX "LineCandidate_datasetId_tStart_tEnd_idx" ON "LineCandidate"("datasetId", "tStart", "tEnd");

-- CreateIndex
CREATE INDEX "LineScore_candidateId_modelVersion_idx" ON "LineScore"("candidateId", "modelVersion");

-- CreateIndex
CREATE INDEX "LineScore_createdAt_idx" ON "LineScore"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_candidateId_idx" ON "Feedback"("candidateId");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ModelVersion_name_key" ON "ModelVersion"("name");

-- AddForeignKey
ALTER TABLE "Candle" ADD CONSTRAINT "Candle_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pivot" ADD CONSTRAINT "Pivot_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineCandidate" ADD CONSTRAINT "LineCandidate_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineScore" ADD CONSTRAINT "LineScore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "LineCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "LineCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
