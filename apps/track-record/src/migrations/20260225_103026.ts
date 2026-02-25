import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_grants_currency" AS ENUM('USD', 'ZAR', 'EUR');
  CREATE TYPE "public"."enum_grants_status" AS ENUM('draft', 'applied', 'awarded', 'active', 'completed');
  CREATE TABLE "grants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"currency" "enum_grants_currency" DEFAULT 'ZAR',
  	"funder" varchar,
  	"organisational_project" varchar,
  	"date_awarded" timestamp(3) with time zone,
  	"description" jsonb,
  	"status" "enum_grants_status",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "grants_id" integer;
  CREATE INDEX "grants_updated_at_idx" ON "grants" USING btree ("updated_at");
  CREATE INDEX "grants_created_at_idx" ON "grants" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_grants_fk" FOREIGN KEY ("grants_id") REFERENCES "public"."grants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_grants_id_idx" ON "payload_locked_documents_rels" USING btree ("grants_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "grants" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "grants" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_grants_fk";
  
  DROP INDEX "payload_locked_documents_rels_grants_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "grants_id";
  DROP TYPE "public"."enum_grants_currency";
  DROP TYPE "public"."enum_grants_status";`)
}
