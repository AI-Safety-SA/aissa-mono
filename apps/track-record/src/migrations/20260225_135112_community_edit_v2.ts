import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_community_submissions_status" AS ENUM('draft', 'pending_verification', 'pending_review', 'approved', 'rejected', 'partial');
  CREATE TYPE "public"."enum_staged_person_updates_field" AS ENUM('fullName', 'preferredName', 'personTag', 'bio', 'websiteUrl', 'organisation', 'headshot');
  CREATE TYPE "public"."enum_staged_person_updates_review_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_staged_engagements_context_kind" AS ENUM('event', 'program');
  CREATE TYPE "public"."enum_staged_engagements_type" AS ENUM('participant', 'facilitator', 'speaker', 'volunteer', 'organizer', 'mentor', 'other');
  CREATE TYPE "public"."enum_staged_engagements_engagement_status" AS ENUM('completed', 'dropped_out', 'in_progress', 'withdrawn', 'attended');
  CREATE TYPE "public"."enum_staged_engagements_operation" AS ENUM('create', 'update');
  CREATE TYPE "public"."enum_staged_engagements_review_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_staged_engagement_removals_review_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_staged_testimonials_context_kind" AS ENUM('event', 'program');
  CREATE TYPE "public"."enum_staged_testimonials_review_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_staged_engagement_impacts_context_kind" AS ENUM('event', 'program');
  CREATE TYPE "public"."enum_staged_engagement_impacts_type" AS ENUM('career_transition', 'research_contribution', 'community_building', 'grant_awarded', 'publication', 'educational', 'community', 'other');
  CREATE TYPE "public"."enum_staged_engagement_impacts_action_category" AS ENUM('career_role', 'grant', 'internship', 'academic_pivot', 'upskilling', 'community_building', 'research');
  CREATE TYPE "public"."enum_staged_engagement_impacts_review_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TABLE "community_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"person_id" integer NOT NULL,
  	"email" varchar NOT NULL,
  	"verified_email" boolean DEFAULT false,
  	"verification_token_hash" varchar,
  	"verification_expires" timestamp(3) with time zone,
  	"status" "enum_community_submissions_status" DEFAULT 'draft' NOT NULL,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"review_notes" varchar,
  	"submitted_at" timestamp(3) with time zone,
  	"general_testimonial" varchar,
  	"general_testimonial_consent" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "staged_person_updates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"submission_id" integer NOT NULL,
  	"field" "enum_staged_person_updates_field" NOT NULL,
  	"current_value" jsonb,
  	"proposed_value" jsonb NOT NULL,
  	"review_status" "enum_staged_person_updates_review_status" DEFAULT 'pending' NOT NULL,
  	"review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "staged_engagements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"submission_id" integer NOT NULL,
  	"context_kind" "enum_staged_engagements_context_kind" NOT NULL,
  	"context_date" timestamp(3) with time zone,
  	"type" "enum_staged_engagements_type" NOT NULL,
  	"type_other" varchar,
  	"engagement_status" "enum_staged_engagements_engagement_status",
  	"rating" numeric,
  	"would_recommend" numeric,
  	"operation" "enum_staged_engagements_operation" DEFAULT 'create' NOT NULL,
  	"existing_engagement_id" integer,
  	"review_status" "enum_staged_engagements_review_status" DEFAULT 'pending' NOT NULL,
  	"review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "staged_engagements_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"programs_id" integer
  );
  
  CREATE TABLE "staged_engagement_removals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"submission_id" integer NOT NULL,
  	"engagement_id" integer NOT NULL,
  	"reason" varchar NOT NULL,
  	"review_status" "enum_staged_engagement_removals_review_status" DEFAULT 'pending' NOT NULL,
  	"review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "staged_testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"submission_id" integer NOT NULL,
  	"context_kind" "enum_staged_testimonials_context_kind",
  	"context_date" timestamp(3) with time zone,
  	"quote" varchar NOT NULL,
  	"rating" numeric,
  	"consent_to_publish" boolean DEFAULT false,
  	"review_status" "enum_staged_testimonials_review_status" DEFAULT 'pending' NOT NULL,
  	"review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "staged_testimonials_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"programs_id" integer
  );
  
  CREATE TABLE "staged_engagement_impacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"submission_id" integer NOT NULL,
  	"context_kind" "enum_staged_engagement_impacts_context_kind" NOT NULL,
  	"type" "enum_staged_engagement_impacts_type" NOT NULL,
  	"type_other" varchar,
  	"summary" varchar NOT NULL,
  	"evidence_url" varchar,
  	"aissa_influence_score" numeric,
  	"action_category" "enum_staged_engagement_impacts_action_category",
  	"review_status" "enum_staged_engagement_impacts_review_status" DEFAULT 'pending' NOT NULL,
  	"review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "staged_engagement_impacts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"programs_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "community_submissions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "staged_person_updates_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "staged_engagements_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "staged_engagement_removals_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "staged_testimonials_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "staged_engagement_impacts_id" integer;
  ALTER TABLE "community_submissions" ADD CONSTRAINT "community_submissions_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "community_submissions" ADD CONSTRAINT "community_submissions_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staged_person_updates" ADD CONSTRAINT "staged_person_updates_submission_id_community_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."community_submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staged_engagements" ADD CONSTRAINT "staged_engagements_submission_id_community_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."community_submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staged_engagements" ADD CONSTRAINT "staged_engagements_existing_engagement_id_engagements_id_fk" FOREIGN KEY ("existing_engagement_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staged_engagements_rels" ADD CONSTRAINT "staged_engagements_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."staged_engagements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staged_engagements_rels" ADD CONSTRAINT "staged_engagements_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staged_engagements_rels" ADD CONSTRAINT "staged_engagements_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staged_engagement_removals" ADD CONSTRAINT "staged_engagement_removals_submission_id_community_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."community_submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staged_engagement_removals" ADD CONSTRAINT "staged_engagement_removals_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staged_testimonials" ADD CONSTRAINT "staged_testimonials_submission_id_community_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."community_submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staged_testimonials_rels" ADD CONSTRAINT "staged_testimonials_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."staged_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staged_testimonials_rels" ADD CONSTRAINT "staged_testimonials_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staged_testimonials_rels" ADD CONSTRAINT "staged_testimonials_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staged_engagement_impacts" ADD CONSTRAINT "staged_engagement_impacts_submission_id_community_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."community_submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staged_engagement_impacts_rels" ADD CONSTRAINT "staged_engagement_impacts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."staged_engagement_impacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staged_engagement_impacts_rels" ADD CONSTRAINT "staged_engagement_impacts_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staged_engagement_impacts_rels" ADD CONSTRAINT "staged_engagement_impacts_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "community_submissions_person_idx" ON "community_submissions" USING btree ("person_id");
  CREATE INDEX "community_submissions_email_idx" ON "community_submissions" USING btree ("email");
  CREATE INDEX "community_submissions_verified_email_idx" ON "community_submissions" USING btree ("verified_email");
  CREATE INDEX "community_submissions_verification_token_hash_idx" ON "community_submissions" USING btree ("verification_token_hash");
  CREATE INDEX "community_submissions_verification_expires_idx" ON "community_submissions" USING btree ("verification_expires");
  CREATE INDEX "community_submissions_status_idx" ON "community_submissions" USING btree ("status");
  CREATE INDEX "community_submissions_reviewed_by_idx" ON "community_submissions" USING btree ("reviewed_by_id");
  CREATE INDEX "community_submissions_submitted_at_idx" ON "community_submissions" USING btree ("submitted_at");
  CREATE INDEX "community_submissions_updated_at_idx" ON "community_submissions" USING btree ("updated_at");
  CREATE INDEX "community_submissions_created_at_idx" ON "community_submissions" USING btree ("created_at");
  CREATE INDEX "staged_person_updates_submission_idx" ON "staged_person_updates" USING btree ("submission_id");
  CREATE INDEX "staged_person_updates_field_idx" ON "staged_person_updates" USING btree ("field");
  CREATE INDEX "staged_person_updates_review_status_idx" ON "staged_person_updates" USING btree ("review_status");
  CREATE INDEX "staged_person_updates_updated_at_idx" ON "staged_person_updates" USING btree ("updated_at");
  CREATE INDEX "staged_person_updates_created_at_idx" ON "staged_person_updates" USING btree ("created_at");
  CREATE INDEX "staged_engagements_submission_idx" ON "staged_engagements" USING btree ("submission_id");
  CREATE INDEX "staged_engagements_context_kind_idx" ON "staged_engagements" USING btree ("context_kind");
  CREATE INDEX "staged_engagements_context_date_idx" ON "staged_engagements" USING btree ("context_date");
  CREATE INDEX "staged_engagements_existing_engagement_idx" ON "staged_engagements" USING btree ("existing_engagement_id");
  CREATE INDEX "staged_engagements_review_status_idx" ON "staged_engagements" USING btree ("review_status");
  CREATE INDEX "staged_engagements_updated_at_idx" ON "staged_engagements" USING btree ("updated_at");
  CREATE INDEX "staged_engagements_created_at_idx" ON "staged_engagements" USING btree ("created_at");
  CREATE INDEX "staged_engagements_rels_order_idx" ON "staged_engagements_rels" USING btree ("order");
  CREATE INDEX "staged_engagements_rels_parent_idx" ON "staged_engagements_rels" USING btree ("parent_id");
  CREATE INDEX "staged_engagements_rels_path_idx" ON "staged_engagements_rels" USING btree ("path");
  CREATE INDEX "staged_engagements_rels_events_id_idx" ON "staged_engagements_rels" USING btree ("events_id");
  CREATE INDEX "staged_engagements_rels_programs_id_idx" ON "staged_engagements_rels" USING btree ("programs_id");
  CREATE INDEX "staged_engagement_removals_submission_idx" ON "staged_engagement_removals" USING btree ("submission_id");
  CREATE INDEX "staged_engagement_removals_engagement_idx" ON "staged_engagement_removals" USING btree ("engagement_id");
  CREATE INDEX "staged_engagement_removals_review_status_idx" ON "staged_engagement_removals" USING btree ("review_status");
  CREATE INDEX "staged_engagement_removals_updated_at_idx" ON "staged_engagement_removals" USING btree ("updated_at");
  CREATE INDEX "staged_engagement_removals_created_at_idx" ON "staged_engagement_removals" USING btree ("created_at");
  CREATE INDEX "staged_testimonials_submission_idx" ON "staged_testimonials" USING btree ("submission_id");
  CREATE INDEX "staged_testimonials_context_kind_idx" ON "staged_testimonials" USING btree ("context_kind");
  CREATE INDEX "staged_testimonials_context_date_idx" ON "staged_testimonials" USING btree ("context_date");
  CREATE INDEX "staged_testimonials_review_status_idx" ON "staged_testimonials" USING btree ("review_status");
  CREATE INDEX "staged_testimonials_updated_at_idx" ON "staged_testimonials" USING btree ("updated_at");
  CREATE INDEX "staged_testimonials_created_at_idx" ON "staged_testimonials" USING btree ("created_at");
  CREATE INDEX "staged_testimonials_rels_order_idx" ON "staged_testimonials_rels" USING btree ("order");
  CREATE INDEX "staged_testimonials_rels_parent_idx" ON "staged_testimonials_rels" USING btree ("parent_id");
  CREATE INDEX "staged_testimonials_rels_path_idx" ON "staged_testimonials_rels" USING btree ("path");
  CREATE INDEX "staged_testimonials_rels_events_id_idx" ON "staged_testimonials_rels" USING btree ("events_id");
  CREATE INDEX "staged_testimonials_rels_programs_id_idx" ON "staged_testimonials_rels" USING btree ("programs_id");
  CREATE INDEX "staged_engagement_impacts_submission_idx" ON "staged_engagement_impacts" USING btree ("submission_id");
  CREATE INDEX "staged_engagement_impacts_context_kind_idx" ON "staged_engagement_impacts" USING btree ("context_kind");
  CREATE INDEX "staged_engagement_impacts_review_status_idx" ON "staged_engagement_impacts" USING btree ("review_status");
  CREATE INDEX "staged_engagement_impacts_updated_at_idx" ON "staged_engagement_impacts" USING btree ("updated_at");
  CREATE INDEX "staged_engagement_impacts_created_at_idx" ON "staged_engagement_impacts" USING btree ("created_at");
  CREATE INDEX "staged_engagement_impacts_rels_order_idx" ON "staged_engagement_impacts_rels" USING btree ("order");
  CREATE INDEX "staged_engagement_impacts_rels_parent_idx" ON "staged_engagement_impacts_rels" USING btree ("parent_id");
  CREATE INDEX "staged_engagement_impacts_rels_path_idx" ON "staged_engagement_impacts_rels" USING btree ("path");
  CREATE INDEX "staged_engagement_impacts_rels_events_id_idx" ON "staged_engagement_impacts_rels" USING btree ("events_id");
  CREATE INDEX "staged_engagement_impacts_rels_programs_id_idx" ON "staged_engagement_impacts_rels" USING btree ("programs_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_community_submissions_fk" FOREIGN KEY ("community_submissions_id") REFERENCES "public"."community_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_staged_person_updates_fk" FOREIGN KEY ("staged_person_updates_id") REFERENCES "public"."staged_person_updates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_staged_engagements_fk" FOREIGN KEY ("staged_engagements_id") REFERENCES "public"."staged_engagements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_staged_engagement_removals_fk" FOREIGN KEY ("staged_engagement_removals_id") REFERENCES "public"."staged_engagement_removals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_staged_testimonials_fk" FOREIGN KEY ("staged_testimonials_id") REFERENCES "public"."staged_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_staged_engagement_impacts_fk" FOREIGN KEY ("staged_engagement_impacts_id") REFERENCES "public"."staged_engagement_impacts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_community_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("community_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_staged_person_updates_id_idx" ON "payload_locked_documents_rels" USING btree ("staged_person_updates_id");
  CREATE INDEX "payload_locked_documents_rels_staged_engagements_id_idx" ON "payload_locked_documents_rels" USING btree ("staged_engagements_id");
  CREATE INDEX "payload_locked_documents_rels_staged_engagement_removals_idx" ON "payload_locked_documents_rels" USING btree ("staged_engagement_removals_id");
  CREATE INDEX "payload_locked_documents_rels_staged_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("staged_testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_staged_engagement_impacts__idx" ON "payload_locked_documents_rels" USING btree ("staged_engagement_impacts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "community_submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "staged_person_updates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "staged_engagements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "staged_engagements_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "staged_engagement_removals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "staged_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "staged_testimonials_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "staged_engagement_impacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "staged_engagement_impacts_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "community_submissions" CASCADE;
  DROP TABLE "staged_person_updates" CASCADE;
  DROP TABLE "staged_engagements" CASCADE;
  DROP TABLE "staged_engagements_rels" CASCADE;
  DROP TABLE "staged_engagement_removals" CASCADE;
  DROP TABLE "staged_testimonials" CASCADE;
  DROP TABLE "staged_testimonials_rels" CASCADE;
  DROP TABLE "staged_engagement_impacts" CASCADE;
  DROP TABLE "staged_engagement_impacts_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_community_submissions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_staged_person_updates_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_staged_engagements_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_staged_engagement_removals_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_staged_testimonials_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_staged_engagement_impacts_fk";
  
  DROP INDEX "payload_locked_documents_rels_community_submissions_id_idx";
  DROP INDEX "payload_locked_documents_rels_staged_person_updates_id_idx";
  DROP INDEX "payload_locked_documents_rels_staged_engagements_id_idx";
  DROP INDEX "payload_locked_documents_rels_staged_engagement_removals_idx";
  DROP INDEX "payload_locked_documents_rels_staged_testimonials_id_idx";
  DROP INDEX "payload_locked_documents_rels_staged_engagement_impacts__idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "community_submissions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "staged_person_updates_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "staged_engagements_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "staged_engagement_removals_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "staged_testimonials_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "staged_engagement_impacts_id";
  DROP TYPE "public"."enum_community_submissions_status";
  DROP TYPE "public"."enum_staged_person_updates_field";
  DROP TYPE "public"."enum_staged_person_updates_review_status";
  DROP TYPE "public"."enum_staged_engagements_context_kind";
  DROP TYPE "public"."enum_staged_engagements_type";
  DROP TYPE "public"."enum_staged_engagements_engagement_status";
  DROP TYPE "public"."enum_staged_engagements_operation";
  DROP TYPE "public"."enum_staged_engagements_review_status";
  DROP TYPE "public"."enum_staged_engagement_removals_review_status";
  DROP TYPE "public"."enum_staged_testimonials_context_kind";
  DROP TYPE "public"."enum_staged_testimonials_review_status";
  DROP TYPE "public"."enum_staged_engagement_impacts_context_kind";
  DROP TYPE "public"."enum_staged_engagement_impacts_type";
  DROP TYPE "public"."enum_staged_engagement_impacts_action_category";
  DROP TYPE "public"."enum_staged_engagement_impacts_review_status";`)
}
