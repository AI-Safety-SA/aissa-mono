import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_external_identities_provider" AS ENUM('tally', 'google_sheets', 'manual', 'other');
  CREATE TYPE "public"."enum_engagements_context_kind" AS ENUM('event', 'program', 'cohort');
  CREATE TYPE "public"."enum_testimonials_context_kind" AS ENUM('event', 'program', 'cohort');
  CREATE TYPE "public"."enum_feedback_submissions_source" AS ENUM('event_participant_feedback', 'event_facilitator_report', 'program_pre_survey', 'program_post_survey', 'other');
  CREATE TYPE "public"."enum_feedback_submissions_context_kind" AS ENUM('event', 'program', 'cohort');
  CREATE TABLE "external_identities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"provider" "enum_external_identities_provider" NOT NULL,
  	"external_id" varchar NOT NULL,
  	"person_id" integer,
  	"email" varchar,
  	"phone" varchar,
  	"first_seen_at" timestamp(3) with time zone,
  	"last_seen_at" timestamp(3) with time zone,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "engagements_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"programs_id" integer,
  	"cohorts_id" integer
  );
  
  CREATE TABLE "testimonials_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"programs_id" integer,
  	"cohorts_id" integer
  );
  
  CREATE TABLE "feedback_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum_feedback_submissions_source" NOT NULL,
  	"submitted_at" timestamp(3) with time zone,
  	"external_submission_id" varchar,
  	"external_respondent_id" varchar,
  	"person_id" integer,
  	"external_identity_id" integer,
  	"context_kind" "enum_feedback_submissions_context_kind" NOT NULL,
  	"context_date" timestamp(3) with time zone,
  	"rating" numeric,
  	"would_recommend" numeric,
  	"beneficial_aspects" varchar,
  	"improvements" varchar,
  	"future_events" varchar,
  	"consent_to_publish_quote" boolean DEFAULT false,
  	"answers" jsonb,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "feedback_submissions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"programs_id" integer,
  	"cohorts_id" integer
  );
  
  ALTER TABLE "engagements" DROP CONSTRAINT "engagements_event_id_events_id_fk";
  
  ALTER TABLE "engagements" DROP CONSTRAINT "engagements_program_id_programs_id_fk";
  
  ALTER TABLE "engagements" DROP CONSTRAINT "engagements_cohort_id_cohorts_id_fk";
  
  ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_program_id_programs_id_fk";
  
  ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_event_id_events_id_fk";
  
  ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_cohort_id_cohorts_id_fk";
  
  DROP INDEX "engagements_event_idx";
  DROP INDEX "engagements_program_idx";
  DROP INDEX "engagements_cohort_idx";
  DROP INDEX "testimonials_program_idx";
  DROP INDEX "testimonials_event_idx";
  DROP INDEX "testimonials_cohort_idx";
  ALTER TABLE "testimonials" ALTER COLUMN "person_id" DROP NOT NULL;
  ALTER TABLE "engagements" ADD COLUMN "context_kind" "enum_engagements_context_kind" NOT NULL;
  ALTER TABLE "engagements" ADD COLUMN "context_date" timestamp(3) with time zone;
  ALTER TABLE "testimonials" ADD COLUMN "context_kind" "enum_testimonials_context_kind";
  ALTER TABLE "testimonials" ADD COLUMN "context_date" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "external_identities_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "feedback_submissions_id" integer;
  ALTER TABLE "external_identities" ADD CONSTRAINT "external_identities_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagements_rels" ADD CONSTRAINT "engagements_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "engagements_rels" ADD CONSTRAINT "engagements_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "engagements_rels" ADD CONSTRAINT "engagements_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "engagements_rels" ADD CONSTRAINT "engagements_rels_cohorts_fk" FOREIGN KEY ("cohorts_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_rels" ADD CONSTRAINT "testimonials_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_rels" ADD CONSTRAINT "testimonials_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_rels" ADD CONSTRAINT "testimonials_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_rels" ADD CONSTRAINT "testimonials_rels_cohorts_fk" FOREIGN KEY ("cohorts_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_external_identity_id_external_identities_id_fk" FOREIGN KEY ("external_identity_id") REFERENCES "public"."external_identities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "feedback_submissions_rels" ADD CONSTRAINT "feedback_submissions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."feedback_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_submissions_rels" ADD CONSTRAINT "feedback_submissions_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_submissions_rels" ADD CONSTRAINT "feedback_submissions_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_submissions_rels" ADD CONSTRAINT "feedback_submissions_rels_cohorts_fk" FOREIGN KEY ("cohorts_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "external_identities_key_idx" ON "external_identities" USING btree ("key");
  CREATE INDEX "external_identities_provider_idx" ON "external_identities" USING btree ("provider");
  CREATE INDEX "external_identities_external_id_idx" ON "external_identities" USING btree ("external_id");
  CREATE INDEX "external_identities_person_idx" ON "external_identities" USING btree ("person_id");
  CREATE INDEX "external_identities_email_idx" ON "external_identities" USING btree ("email");
  CREATE INDEX "external_identities_phone_idx" ON "external_identities" USING btree ("phone");
  CREATE INDEX "external_identities_updated_at_idx" ON "external_identities" USING btree ("updated_at");
  CREATE INDEX "external_identities_created_at_idx" ON "external_identities" USING btree ("created_at");
  CREATE INDEX "engagements_rels_order_idx" ON "engagements_rels" USING btree ("order");
  CREATE INDEX "engagements_rels_parent_idx" ON "engagements_rels" USING btree ("parent_id");
  CREATE INDEX "engagements_rels_path_idx" ON "engagements_rels" USING btree ("path");
  CREATE INDEX "engagements_rels_events_id_idx" ON "engagements_rels" USING btree ("events_id");
  CREATE INDEX "engagements_rels_programs_id_idx" ON "engagements_rels" USING btree ("programs_id");
  CREATE INDEX "engagements_rels_cohorts_id_idx" ON "engagements_rels" USING btree ("cohorts_id");
  CREATE INDEX "testimonials_rels_order_idx" ON "testimonials_rels" USING btree ("order");
  CREATE INDEX "testimonials_rels_parent_idx" ON "testimonials_rels" USING btree ("parent_id");
  CREATE INDEX "testimonials_rels_path_idx" ON "testimonials_rels" USING btree ("path");
  CREATE INDEX "testimonials_rels_events_id_idx" ON "testimonials_rels" USING btree ("events_id");
  CREATE INDEX "testimonials_rels_programs_id_idx" ON "testimonials_rels" USING btree ("programs_id");
  CREATE INDEX "testimonials_rels_cohorts_id_idx" ON "testimonials_rels" USING btree ("cohorts_id");
  CREATE INDEX "feedback_submissions_source_idx" ON "feedback_submissions" USING btree ("source");
  CREATE INDEX "feedback_submissions_submitted_at_idx" ON "feedback_submissions" USING btree ("submitted_at");
  CREATE INDEX "feedback_submissions_external_submission_id_idx" ON "feedback_submissions" USING btree ("external_submission_id");
  CREATE INDEX "feedback_submissions_external_respondent_id_idx" ON "feedback_submissions" USING btree ("external_respondent_id");
  CREATE INDEX "feedback_submissions_person_idx" ON "feedback_submissions" USING btree ("person_id");
  CREATE INDEX "feedback_submissions_external_identity_idx" ON "feedback_submissions" USING btree ("external_identity_id");
  CREATE INDEX "feedback_submissions_context_kind_idx" ON "feedback_submissions" USING btree ("context_kind");
  CREATE INDEX "feedback_submissions_context_date_idx" ON "feedback_submissions" USING btree ("context_date");
  CREATE INDEX "feedback_submissions_updated_at_idx" ON "feedback_submissions" USING btree ("updated_at");
  CREATE INDEX "feedback_submissions_created_at_idx" ON "feedback_submissions" USING btree ("created_at");
  CREATE INDEX "feedback_submissions_rels_order_idx" ON "feedback_submissions_rels" USING btree ("order");
  CREATE INDEX "feedback_submissions_rels_parent_idx" ON "feedback_submissions_rels" USING btree ("parent_id");
  CREATE INDEX "feedback_submissions_rels_path_idx" ON "feedback_submissions_rels" USING btree ("path");
  CREATE INDEX "feedback_submissions_rels_events_id_idx" ON "feedback_submissions_rels" USING btree ("events_id");
  CREATE INDEX "feedback_submissions_rels_programs_id_idx" ON "feedback_submissions_rels" USING btree ("programs_id");
  CREATE INDEX "feedback_submissions_rels_cohorts_id_idx" ON "feedback_submissions_rels" USING btree ("cohorts_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_external_identities_fk" FOREIGN KEY ("external_identities_id") REFERENCES "public"."external_identities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feedback_submissions_fk" FOREIGN KEY ("feedback_submissions_id") REFERENCES "public"."feedback_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "engagements_context_kind_idx" ON "engagements" USING btree ("context_kind");
  CREATE INDEX "engagements_context_date_idx" ON "engagements" USING btree ("context_date");
  CREATE INDEX "testimonials_context_kind_idx" ON "testimonials" USING btree ("context_kind");
  CREATE INDEX "testimonials_context_date_idx" ON "testimonials" USING btree ("context_date");
  CREATE INDEX "payload_locked_documents_rels_external_identities_id_idx" ON "payload_locked_documents_rels" USING btree ("external_identities_id");
  CREATE INDEX "payload_locked_documents_rels_feedback_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("feedback_submissions_id");
  ALTER TABLE "engagements" DROP COLUMN "event_id";
  ALTER TABLE "engagements" DROP COLUMN "program_id";
  ALTER TABLE "engagements" DROP COLUMN "cohort_id";
  ALTER TABLE "testimonials" DROP COLUMN "program_id";
  ALTER TABLE "testimonials" DROP COLUMN "event_id";
  ALTER TABLE "testimonials" DROP COLUMN "cohort_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "external_identities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "engagements_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedback_submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedback_submissions_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "external_identities" CASCADE;
  DROP TABLE "engagements_rels" CASCADE;
  DROP TABLE "testimonials_rels" CASCADE;
  DROP TABLE "feedback_submissions" CASCADE;
  DROP TABLE "feedback_submissions_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_external_identities_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_feedback_submissions_fk";
  
  DROP INDEX "engagements_context_kind_idx";
  DROP INDEX "engagements_context_date_idx";
  DROP INDEX "testimonials_context_kind_idx";
  DROP INDEX "testimonials_context_date_idx";
  DROP INDEX "payload_locked_documents_rels_external_identities_id_idx";
  DROP INDEX "payload_locked_documents_rels_feedback_submissions_id_idx";
  ALTER TABLE "testimonials" ALTER COLUMN "person_id" SET NOT NULL;
  ALTER TABLE "engagements" ADD COLUMN "event_id" integer;
  ALTER TABLE "engagements" ADD COLUMN "program_id" integer;
  ALTER TABLE "engagements" ADD COLUMN "cohort_id" integer;
  ALTER TABLE "testimonials" ADD COLUMN "program_id" integer;
  ALTER TABLE "testimonials" ADD COLUMN "event_id" integer;
  ALTER TABLE "testimonials" ADD COLUMN "cohort_id" integer;
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "engagements_event_idx" ON "engagements" USING btree ("event_id");
  CREATE INDEX "engagements_program_idx" ON "engagements" USING btree ("program_id");
  CREATE INDEX "engagements_cohort_idx" ON "engagements" USING btree ("cohort_id");
  CREATE INDEX "testimonials_program_idx" ON "testimonials" USING btree ("program_id");
  CREATE INDEX "testimonials_event_idx" ON "testimonials" USING btree ("event_id");
  CREATE INDEX "testimonials_cohort_idx" ON "testimonials" USING btree ("cohort_id");
  ALTER TABLE "engagements" DROP COLUMN "context_kind";
  ALTER TABLE "engagements" DROP COLUMN "context_date";
  ALTER TABLE "testimonials" DROP COLUMN "context_kind";
  ALTER TABLE "testimonials" DROP COLUMN "context_date";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "external_identities_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "feedback_submissions_id";
  DROP TYPE "public"."enum_external_identities_provider";
  DROP TYPE "public"."enum_engagements_context_kind";
  DROP TYPE "public"."enum_testimonials_context_kind";
  DROP TYPE "public"."enum_feedback_submissions_source";
  DROP TYPE "public"."enum_feedback_submissions_context_kind";`)
}
