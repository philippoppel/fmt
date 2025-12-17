-- AlterTable: Add personal website fields to therapist_profiles
ALTER TABLE "therapist_profiles" ADD COLUMN "slug" TEXT;
ALTER TABLE "therapist_profiles" ADD COLUMN "headline" TEXT;
ALTER TABLE "therapist_profiles" ADD COLUMN "longDescription" TEXT;
ALTER TABLE "therapist_profiles" ADD COLUMN "education" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "therapist_profiles" ADD COLUMN "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "therapist_profiles" ADD COLUMN "memberships" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "therapist_profiles" ADD COLUMN "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "therapist_profiles" ADD COLUMN "phone" TEXT;
ALTER TABLE "therapist_profiles" ADD COLUMN "email" TEXT;
ALTER TABLE "therapist_profiles" ADD COLUMN "website" TEXT;
ALTER TABLE "therapist_profiles" ADD COLUMN "linkedIn" TEXT;
ALTER TABLE "therapist_profiles" ADD COLUMN "instagram" TEXT;
ALTER TABLE "therapist_profiles" ADD COLUMN "themeColor" TEXT DEFAULT '#8B7355';
ALTER TABLE "therapist_profiles" ADD COLUMN "themeName" TEXT DEFAULT 'warm';
ALTER TABLE "therapist_profiles" ADD COLUMN "practiceName" TEXT;
ALTER TABLE "therapist_profiles" ADD COLUMN "street" TEXT;
ALTER TABLE "therapist_profiles" ADD COLUMN "officeImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "therapist_profiles" ADD COLUMN "workingHours" JSONB;
ALTER TABLE "therapist_profiles" ADD COLUMN "consultationInfo" TEXT;

-- CreateIndex: Unique constraint on slug
CREATE UNIQUE INDEX "therapist_profiles_slug_key" ON "therapist_profiles"("slug");

-- CreateIndex: Index on slug for faster lookups
CREATE INDEX "therapist_profiles_slug_idx" ON "therapist_profiles"("slug");
