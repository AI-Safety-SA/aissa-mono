import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_persons_auth_provider" AS ENUM('manual', 'workos');
  CREATE TYPE "public"."enum_context_nodes_type" AS ENUM('event', 'program', 'cohort', 'desk_session', 'feedback_form', 'external_event', 'other');
  CREATE TYPE "public"."enum_context_nodes_source_collection" AS ENUM('events', 'programs', 'cohorts', 'desk-booking', 'survey', 'luma', 'manual');
  ALTER TYPE "public"."enum_engagements_context_kind" ADD VALUE 'desk_session';
  ALTER TYPE "public"."enum_engagements_context_kind" ADD VALUE 'feedback_form';
  ALTER TYPE "public"."enum_engagements_context_kind" ADD VALUE 'external_event';
  ALTER TYPE "public"."enum_engagements_context_kind" ADD VALUE 'other';
  ALTER TYPE "public"."enum_testimonials_context_kind" ADD VALUE 'desk_session';
  ALTER TYPE "public"."enum_testimonials_context_kind" ADD VALUE 'feedback_form';
  ALTER TYPE "public"."enum_testimonials_context_kind" ADD VALUE 'external_event';
  ALTER TYPE "public"."enum_testimonials_context_kind" ADD VALUE 'other';
  ALTER TYPE "public"."enum_feedback_submissions_context_kind" ADD VALUE 'desk_session';
  ALTER TYPE "public"."enum_feedback_submissions_context_kind" ADD VALUE 'feedback_form';
  ALTER TYPE "public"."enum_feedback_submissions_context_kind" ADD VALUE 'external_event';
  ALTER TYPE "public"."enum_feedback_submissions_context_kind" ADD VALUE 'other';
  ALTER TYPE "public"."enum_external_identities_provider" ADD VALUE 'luma' BEFORE 'google_sheets';
  ALTER TYPE "public"."enum_external_identities_provider" ADD VALUE 'slack' BEFORE 'google_sheets';
  CREATE TABLE "context_nodes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"type" "enum_context_nodes_type" NOT NULL,
  	"source_collection" "enum_context_nodes_source_collection" NOT NULL,
  	"source_id" varchar NOT NULL,
  	"display_name" varchar NOT NULL,
  	"canonical_date" timestamp(3) with time zone,
  	"is_archived" boolean DEFAULT false,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "engagements" ADD COLUMN "context_node_id" integer;
  ALTER TABLE "testimonials" ADD COLUMN "context_node_id" integer;
  ALTER TABLE "feedback_submissions" ADD COLUMN "context_node_id" integer;
  ALTER TABLE "persons" ADD COLUMN "auth_provider" "enum_persons_auth_provider" DEFAULT 'manual';
  ALTER TABLE "persons" ADD COLUMN "workos_user_id" varchar;
  ALTER TABLE "persons" ADD COLUMN "last_login_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "context_nodes_id" integer;
  CREATE UNIQUE INDEX "context_nodes_key_idx" ON "context_nodes" USING btree ("key");
  CREATE INDEX "context_nodes_type_idx" ON "context_nodes" USING btree ("type");
  CREATE INDEX "context_nodes_source_collection_idx" ON "context_nodes" USING btree ("source_collection");
  CREATE INDEX "context_nodes_source_id_idx" ON "context_nodes" USING btree ("source_id");
  CREATE INDEX "context_nodes_display_name_idx" ON "context_nodes" USING btree ("display_name");
  CREATE INDEX "context_nodes_canonical_date_idx" ON "context_nodes" USING btree ("canonical_date");
  CREATE INDEX "context_nodes_is_archived_idx" ON "context_nodes" USING btree ("is_archived");
  CREATE INDEX "context_nodes_updated_at_idx" ON "context_nodes" USING btree ("updated_at");
  CREATE INDEX "context_nodes_created_at_idx" ON "context_nodes" USING btree ("created_at");
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_context_node_id_context_nodes_id_fk" FOREIGN KEY ("context_node_id") REFERENCES "public"."context_nodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_context_node_id_context_nodes_id_fk" FOREIGN KEY ("context_node_id") REFERENCES "public"."context_nodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_context_node_id_context_nodes_id_fk" FOREIGN KEY ("context_node_id") REFERENCES "public"."context_nodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_context_nodes_fk" FOREIGN KEY ("context_nodes_id") REFERENCES "public"."context_nodes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "engagements_context_node_idx" ON "engagements" USING btree ("context_node_id");
  CREATE INDEX "testimonials_context_node_idx" ON "testimonials" USING btree ("context_node_id");
  CREATE INDEX "feedback_submissions_context_node_idx" ON "feedback_submissions" USING btree ("context_node_id");
  CREATE UNIQUE INDEX "persons_workos_user_id_idx" ON "persons" USING btree ("workos_user_id");
  CREATE INDEX "payload_locked_documents_rels_context_nodes_id_idx" ON "payload_locked_documents_rels" USING btree ("context_nodes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "context_nodes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "context_nodes" CASCADE;
  ALTER TABLE "engagements" DROP CONSTRAINT "engagements_context_node_id_context_nodes_id_fk";
  
  ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_context_node_id_context_nodes_id_fk";
  
  ALTER TABLE "feedback_submissions" DROP CONSTRAINT "feedback_submissions_context_node_id_context_nodes_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_context_nodes_fk";
  
  ALTER TABLE "engagements" ALTER COLUMN "context_kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_engagements_context_kind";
  CREATE TYPE "public"."enum_engagements_context_kind" AS ENUM('event', 'program', 'cohort');
  ALTER TABLE "engagements" ALTER COLUMN "context_kind" SET DATA TYPE "public"."enum_engagements_context_kind" USING "context_kind"::"public"."enum_engagements_context_kind";
  ALTER TABLE "testimonials" ALTER COLUMN "context_kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_testimonials_context_kind";
  CREATE TYPE "public"."enum_testimonials_context_kind" AS ENUM('event', 'program', 'cohort');
  ALTER TABLE "testimonials" ALTER COLUMN "context_kind" SET DATA TYPE "public"."enum_testimonials_context_kind" USING "context_kind"::"public"."enum_testimonials_context_kind";
  ALTER TABLE "feedback_submissions" ALTER COLUMN "context_kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_feedback_submissions_context_kind";
  CREATE TYPE "public"."enum_feedback_submissions_context_kind" AS ENUM('event', 'program', 'cohort');
  ALTER TABLE "feedback_submissions" ALTER COLUMN "context_kind" SET DATA TYPE "public"."enum_feedback_submissions_context_kind" USING "context_kind"::"public"."enum_feedback_submissions_context_kind";
  ALTER TABLE "external_identities" ALTER COLUMN "provider" SET DATA TYPE text;
  DROP TYPE "public"."enum_external_identities_provider";
  CREATE TYPE "public"."enum_external_identities_provider" AS ENUM('tally', 'google_sheets', 'manual', 'other');
  ALTER TABLE "external_identities" ALTER COLUMN "provider" SET DATA TYPE "public"."enum_external_identities_provider" USING "provider"::"public"."enum_external_identities_provider";
  DROP INDEX "engagements_context_node_idx";
  DROP INDEX "testimonials_context_node_idx";
  DROP INDEX "feedback_submissions_context_node_idx";
  DROP INDEX "persons_workos_user_id_idx";
  DROP INDEX "payload_locked_documents_rels_context_nodes_id_idx";
  ALTER TABLE "engagements" DROP COLUMN "context_node_id";
  ALTER TABLE "testimonials" DROP COLUMN "context_node_id";
  ALTER TABLE "feedback_submissions" DROP COLUMN "context_node_id";
  ALTER TABLE "persons" DROP COLUMN "auth_provider";
  ALTER TABLE "persons" DROP COLUMN "workos_user_id";
  ALTER TABLE "persons" DROP COLUMN "last_login_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "context_nodes_id";
  DROP TYPE "public"."enum_persons_auth_provider";
  DROP TYPE "public"."enum_context_nodes_type";
  DROP TYPE "public"."enum_context_nodes_source_collection";`)
}
