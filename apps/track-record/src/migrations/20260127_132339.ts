import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feedback_submissions_workflow_type" AS ENUM('event_participant_feedback', 'event_facilitator_report', 'program_pre_survey', 'program_post_survey');
  CREATE TYPE "public"."enum_feedback_submissions_processing_status" AS ENUM('pending', 'processing', 'completed', 'failed');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'processTallySubmission');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'processTallySubmission');
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "feedback_submissions" ALTER COLUMN "context_kind" DROP NOT NULL;
  ALTER TABLE "feedback_submissions" ADD COLUMN "tally_form_id" varchar;
  ALTER TABLE "feedback_submissions" ADD COLUMN "workflow_type" "enum_feedback_submissions_workflow_type";
  ALTER TABLE "feedback_submissions" ADD COLUMN "processing_status" "enum_feedback_submissions_processing_status" DEFAULT 'pending';
  ALTER TABLE "feedback_submissions" ADD COLUMN "processing_error" varchar;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "feedback_submissions_tally_form_id_idx" ON "feedback_submissions" USING btree ("tally_form_id");
  CREATE INDEX "feedback_submissions_workflow_type_idx" ON "feedback_submissions" USING btree ("workflow_type");
  CREATE INDEX "feedback_submissions_processing_status_idx" ON "feedback_submissions" USING btree ("processing_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP INDEX "feedback_submissions_tally_form_id_idx";
  DROP INDEX "feedback_submissions_workflow_type_idx";
  DROP INDEX "feedback_submissions_processing_status_idx";
  ALTER TABLE "feedback_submissions" ALTER COLUMN "context_kind" SET NOT NULL;
  ALTER TABLE "feedback_submissions" DROP COLUMN "tally_form_id";
  ALTER TABLE "feedback_submissions" DROP COLUMN "workflow_type";
  ALTER TABLE "feedback_submissions" DROP COLUMN "processing_status";
  ALTER TABLE "feedback_submissions" DROP COLUMN "processing_error";
  DROP TYPE "public"."enum_feedback_submissions_workflow_type";
  DROP TYPE "public"."enum_feedback_submissions_processing_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
