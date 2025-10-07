/*
  Warnings:

  - You are about to drop the column `clinicalScore` on the `AssessmentResponse` table. All the data in the column will be lost.
  - You are about to drop the column `recommendations` on the `AssessmentResponse` table. All the data in the column will be lost.
  - Made the column `patientPhone` on table `Appointment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "assessmentId" TEXT,
ADD COLUMN     "clinicianId" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "language" "public"."Language" NOT NULL DEFAULT 'ENGLISH',
ALTER COLUMN "patientPhone" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Assessment" ADD COLUMN     "clinicalScore" TEXT,
ADD COLUMN     "recommendations" TEXT;

-- AlterTable
ALTER TABLE "public"."AssessmentResponse" DROP COLUMN "clinicalScore",
DROP COLUMN "recommendations";

-- CreateTable
CREATE TABLE "public"."AppointmentReminder" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "reminderType" TEXT NOT NULL,
    "reminderTime" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentReminder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AppointmentReminder" ADD CONSTRAINT "AppointmentReminder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
