import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_engagement_impacts_type" ADD VALUE 'other';
  ALTER TYPE "public"."enum_programs_type" ADD VALUE 'hackathon' BEFORE 'coworking';
  ALTER TYPE "public"."enum_programs_type" ADD VALUE 'other';
  ALTER TYPE "public"."enum_events_type" ADD VALUE 'other';
  ALTER TYPE "public"."enum_projects_type" ADD VALUE 'program_project';
  ALTER TYPE "public"."enum_projects_type" ADD VALUE 'other';
  ALTER TYPE "public"."enum_project_contributors_role" ADD VALUE 'other';
  ALTER TABLE "engagements" ADD COLUMN "type_other" varchar;
  ALTER TABLE "engagement_impacts" ADD COLUMN "type_other" varchar;
  ALTER TABLE "feedback_submissions" ADD COLUMN "type_other" varchar;
  ALTER TABLE "programs" ADD COLUMN "type_other" varchar;
  ALTER TABLE "events" ADD COLUMN "type_other" varchar;
  ALTER TABLE "projects" ADD COLUMN "type_other" varchar;
  ALTER TABLE "project_contributors" ADD COLUMN "role_other" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "engagement_impacts" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_engagement_impacts_type";
  CREATE TYPE "public"."enum_engagement_impacts_type" AS ENUM('career_transition', 'research_contribution', 'community_building', 'grant_awarded', 'publication', 'educational', 'community');
  ALTER TABLE "engagement_impacts" ALTER COLUMN "type" SET DATA TYPE "public"."enum_engagement_impacts_type" USING "type"::"public"."enum_engagement_impacts_type";
  ALTER TABLE "programs" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_programs_type";
  CREATE TYPE "public"."enum_programs_type" AS ENUM('fellowship', 'course', 'coworking', 'volunteer_program');
  ALTER TABLE "programs" ALTER COLUMN "type" SET DATA TYPE "public"."enum_programs_type" USING "type"::"public"."enum_programs_type";
  ALTER TABLE "events" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_type";
  CREATE TYPE "public"."enum_events_type" AS ENUM('workshop', 'talk', 'meetup', 'reading_group', 'retreat', 'panel');
  ALTER TABLE "events" ALTER COLUMN "type" SET DATA TYPE "public"."enum_events_type" USING "type"::"public"."enum_events_type";
  ALTER TABLE "projects" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_projects_type";
  CREATE TYPE "public"."enum_projects_type" AS ENUM('research_paper', 'bounty_submission', 'grant_award', 'software_tool');
  ALTER TABLE "projects" ALTER COLUMN "type" SET DATA TYPE "public"."enum_projects_type" USING "type"::"public"."enum_projects_type";
  ALTER TABLE "project_contributors" ALTER COLUMN "role" SET DATA TYPE text;
  DROP TYPE "public"."enum_project_contributors_role";
  CREATE TYPE "public"."enum_project_contributors_role" AS ENUM('lead_author', 'co_author', 'contributor', 'advisor');
  ALTER TABLE "project_contributors" ALTER COLUMN "role" SET DATA TYPE "public"."enum_project_contributors_role" USING "role"::"public"."enum_project_contributors_role";
  ALTER TABLE "engagements" DROP COLUMN "type_other";
  ALTER TABLE "engagement_impacts" DROP COLUMN "type_other";
  ALTER TABLE "feedback_submissions" DROP COLUMN "type_other";
  ALTER TABLE "programs" DROP COLUMN "type_other";
  ALTER TABLE "events" DROP COLUMN "type_other";
  ALTER TABLE "projects" DROP COLUMN "type_other";
  ALTER TABLE "project_contributors" DROP COLUMN "role_other";`)
}
