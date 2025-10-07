/*
  Warnings:

  - You are about to drop the column `patientEmail` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `patientName` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `patientPhone` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `registrantEmail` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `registrantName` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `registrantPhone` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `relationship` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `subjectAge` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `subjectGender` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `subjectName` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Assessment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assessmentNumber]` on the table `Assessment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `patientId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - The required column `assessmentNumber` was added to the `Assessment` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `patientId` to the `Assessment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AssessmentPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- DropForeignKey
ALTER TABLE "public"."Assessment" DROP CONSTRAINT "Assessment_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Appointment" DROP COLUMN "patientEmail",
DROP COLUMN "patientName",
DROP COLUMN "patientPhone",
ADD COLUMN     "patientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Assessment" DROP COLUMN "registrantEmail",
DROP COLUMN "registrantName",
DROP COLUMN "registrantPhone",
DROP COLUMN "relationship",
DROP COLUMN "subjectAge",
DROP COLUMN "subjectGender",
DROP COLUMN "subjectName",
DROP COLUMN "userId",
ADD COLUMN     "assessmentNumber" TEXT NOT NULL,
ADD COLUMN     "patientId" TEXT NOT NULL,
ADD COLUMN     "priority" "public"."AssessmentPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "proxyEmail" TEXT,
ADD COLUMN     "proxyName" TEXT,
ADD COLUMN     "proxyPhone" TEXT,
ADD COLUMN     "proxyRelationship" TEXT,
ADD COLUMN     "submittedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "applicableFor" "public"."FormType"[];

-- CreateTable
CREATE TABLE "public"."Patient" (
    "id" TEXT NOT NULL,
    "mrn" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "public"."Gender",
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "userId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_mrn_key" ON "public"."Patient"("mrn");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "public"."Patient"("userId");

-- CreateIndex
CREATE INDEX "Patient_mrn_idx" ON "public"."Patient"("mrn");

-- CreateIndex
CREATE INDEX "Patient_email_idx" ON "public"."Patient"("email");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "public"."Patient"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_assessmentNumber_key" ON "public"."Assessment"("assessmentNumber");

-- CreateIndex
CREATE INDEX "Assessment_assessmentNumber_idx" ON "public"."Assessment"("assessmentNumber");

-- CreateIndex
CREATE INDEX "Assessment_patientId_idx" ON "public"."Assessment"("patientId");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "public"."Assessment"("status");

-- CreateIndex
CREATE INDEX "Assessment_submittedAt_idx" ON "public"."Assessment"("submittedAt");

-- AddForeignKey
ALTER TABLE "public"."Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
