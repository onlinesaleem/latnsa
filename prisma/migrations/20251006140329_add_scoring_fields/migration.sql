-- CreateEnum
CREATE TYPE "public"."ScoringType" AS ENUM ('SIMPLE', 'WEIGHTED', 'RANGE', 'FORMULA', 'AGGREGATE', 'CONDITIONAL');

-- AlterTable
ALTER TABLE "public"."AssessmentResponse" ADD COLUMN     "score" DOUBLE PRECISION,
ADD COLUMN     "scoreLabel" TEXT;

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "hasScoring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "interpretationRules" TEXT,
ADD COLUMN     "maxScore" DOUBLE PRECISION,
ADD COLUMN     "minScore" DOUBLE PRECISION,
ADD COLUMN     "scoreUnit" TEXT,
ADD COLUMN     "scoringConfig" TEXT,
ADD COLUMN     "scoringType" "public"."ScoringType";

-- AlterTable
ALTER TABLE "public"."QuestionGroup" ADD COLUMN     "hasGroupScoring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "interpretationRules" TEXT,
ADD COLUMN     "scoringConfig" TEXT,
ADD COLUMN     "scoringType" "public"."ScoringType";
