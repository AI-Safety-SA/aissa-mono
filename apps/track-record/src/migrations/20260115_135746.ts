import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_engagements_outcome_career_intent" AS ENUM('no_change', 'considering', 'applying', 'hired');
  CREATE TYPE "public"."enum_engagements_outcome_project_status" AS ENUM('none', 'started', 'completed');
  CREATE TYPE "public"."enum_engagements_career_impact" AS ENUM('no_change', 'considering_transition', 'actively_transitioning', 'transitioned', 'enhanced_current_role');
  CREATE TYPE "public"."enum_engagement_impacts_action_category" AS ENUM('career_role', 'grant', 'internship', 'academic_pivot', 'upskilling', 'community_building', 'research');
  CREATE TYPE "public"."enum_feedback_submissions_form_type" AS ENUM('event_feedback', 'program_pre', 'program_post', 'program_longitudinal', 'annual');
  CREATE TYPE "public"."enum_feedback_submissions_marketing_source" AS ENUM('newsletter', 'linkedin', 'friend', 'university', 'other');
  CREATE TYPE "public"."enum_persons_current_impact_stage" AS ENUM('awareness', 'learning', 'application', 'contribution');
  ALTER TABLE "persons" ADD COLUMN "total_engagements" numeric;
  ALTER TABLE "persons" ADD COLUMN "total_impacts" numeric;
  ALTER TABLE "persons" ADD COLUMN "first_engagement_date" timestamp(3) with time zone;
  ALTER TABLE "persons" ADD COLUMN "last_engagement_date" timestamp(3) with time zone;
  ALTER TABLE "persons" ADD COLUMN "baseline_capability" numeric;
  ALTER TABLE "persons" ADD COLUMN "baseline_network_size" numeric;
  ALTER TABLE "persons" ADD COLUMN "baseline_understanding" numeric;
  ALTER TABLE "persons" ADD COLUMN "current_impact_stage" "enum_persons_current_impact_stage";
  ALTER TABLE "persons" ADD COLUMN "total_engagement_hours" numeric;
  ALTER TABLE "engagements" ADD COLUMN "delta_capability" numeric;
  ALTER TABLE "engagements" ADD COLUMN "delta_network_size" numeric;
  ALTER TABLE "engagements" ADD COLUMN "outcome_career_intent" "enum_engagements_outcome_career_intent";
  ALTER TABLE "engagements" ADD COLUMN "outcome_project_status" "enum_engagements_outcome_project_status";
  ALTER TABLE "engagements" ADD COLUMN "career_impact" "enum_engagements_career_impact";
  ALTER TABLE "engagements" ADD COLUMN "pre_survey_submission_id" integer;
  ALTER TABLE "engagements" ADD COLUMN "post_survey_submission_id" integer;
  ALTER TABLE "engagement_impacts" ADD COLUMN "aissa_influence_score" numeric;
  ALTER TABLE "engagement_impacts" ADD COLUMN "source_submission_id" integer;
  ALTER TABLE "engagement_impacts" ADD COLUMN "action_category" "enum_engagement_impacts_action_category";
  ALTER TABLE "feedback_submissions" ADD COLUMN "form_type" "enum_feedback_submissions_form_type";
  ALTER TABLE "feedback_submissions" ADD COLUMN "is_first_time_attendee" boolean DEFAULT false;
  ALTER TABLE "feedback_submissions" ADD COLUMN "marketing_source" "enum_feedback_submissions_marketing_source";
  ALTER TABLE "feedback_submissions" ADD COLUMN "self_reported_capability" numeric;
  ALTER TABLE "feedback_submissions" ADD COLUMN "network_size" numeric;
  ALTER TABLE "feedback_submissions" ADD COLUMN "understanding_of_risks" numeric;
  ALTER TABLE "feedback_submissions" ADD COLUMN "engagement_id" integer;
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_pre_survey_submission_id_feedback_submissions_id_fk" FOREIGN KEY ("pre_survey_submission_id") REFERENCES "public"."feedback_submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_post_survey_submission_id_feedback_submissions_id_fk" FOREIGN KEY ("post_survey_submission_id") REFERENCES "public"."feedback_submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagement_impacts" ADD CONSTRAINT "engagement_impacts_source_submission_id_feedback_submissions_id_fk" FOREIGN KEY ("source_submission_id") REFERENCES "public"."feedback_submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "engagements_pre_survey_submission_idx" ON "engagements" USING btree ("pre_survey_submission_id");
  CREATE INDEX "engagements_post_survey_submission_idx" ON "engagements" USING btree ("post_survey_submission_id");
  CREATE INDEX "engagement_impacts_source_submission_idx" ON "engagement_impacts" USING btree ("source_submission_id");
  CREATE INDEX "feedback_submissions_engagement_idx" ON "feedback_submissions" USING btree ("engagement_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "engagements" DROP CONSTRAINT "engagements_pre_survey_submission_id_feedback_submissions_id_fk";
  
  ALTER TABLE "engagements" DROP CONSTRAINT "engagements_post_survey_submission_id_feedback_submissions_id_fk";
  
  ALTER TABLE "engagement_impacts" DROP CONSTRAINT "engagement_impacts_source_submission_id_feedback_submissions_id_fk";
  
  ALTER TABLE "feedback_submissions" DROP CONSTRAINT "feedback_submissions_engagement_id_engagements_id_fk";
  
  DROP INDEX "engagements_pre_survey_submission_idx";
  DROP INDEX "engagements_post_survey_submission_idx";
  DROP INDEX "engagement_impacts_source_submission_idx";
  DROP INDEX "feedback_submissions_engagement_idx";
  ALTER TABLE "engagements" DROP COLUMN "delta_capability";
  ALTER TABLE "engagements" DROP COLUMN "delta_network_size";
  ALTER TABLE "engagements" DROP COLUMN "outcome_career_intent";
  ALTER TABLE "engagements" DROP COLUMN "outcome_project_status";
  ALTER TABLE "engagements" DROP COLUMN "career_impact";
  ALTER TABLE "engagements" DROP COLUMN "pre_survey_submission_id";
  ALTER TABLE "engagements" DROP COLUMN "post_survey_submission_id";
  ALTER TABLE "engagement_impacts" DROP COLUMN "aissa_influence_score";
  ALTER TABLE "engagement_impacts" DROP COLUMN "source_submission_id";
  ALTER TABLE "engagement_impacts" DROP COLUMN "action_category";
  ALTER TABLE "feedback_submissions" DROP COLUMN "form_type";
  ALTER TABLE "feedback_submissions" DROP COLUMN "is_first_time_attendee";
  ALTER TABLE "feedback_submissions" DROP COLUMN "marketing_source";
  ALTER TABLE "feedback_submissions" DROP COLUMN "self_reported_capability";
  ALTER TABLE "feedback_submissions" DROP COLUMN "network_size";
  ALTER TABLE "feedback_submissions" DROP COLUMN "understanding_of_risks";
  ALTER TABLE "feedback_submissions" DROP COLUMN "engagement_id";
  ALTER TABLE "persons" DROP COLUMN "total_engagements";
  ALTER TABLE "persons" DROP COLUMN "total_impacts";
  ALTER TABLE "persons" DROP COLUMN "first_engagement_date";
  ALTER TABLE "persons" DROP COLUMN "last_engagement_date";
  ALTER TABLE "persons" DROP COLUMN "baseline_capability";
  ALTER TABLE "persons" DROP COLUMN "baseline_network_size";
  ALTER TABLE "persons" DROP COLUMN "baseline_understanding";
  ALTER TABLE "persons" DROP COLUMN "current_impact_stage";
  ALTER TABLE "persons" DROP COLUMN "total_engagement_hours";
  DROP TYPE "public"."enum_engagements_outcome_career_intent";
  DROP TYPE "public"."enum_engagements_outcome_project_status";
  DROP TYPE "public"."enum_engagements_career_impact";
  DROP TYPE "public"."enum_engagement_impacts_action_category";
  DROP TYPE "public"."enum_feedback_submissions_form_type";
  DROP TYPE "public"."enum_feedback_submissions_marketing_source";
  DROP TYPE "public"."enum_persons_current_impact_stage";`)
}
