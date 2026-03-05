import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "staged_engagement_impacts_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "staged_engagement_impacts_rels" CASCADE;
  DROP INDEX "staged_engagement_impacts_context_kind_idx";
  ALTER TABLE "staged_engagement_impacts" ADD COLUMN "engagement_id" integer;
  ALTER TABLE "staged_engagement_impacts" ADD COLUMN "staged_engagement_id" integer;
  ALTER TABLE "staged_engagement_impacts" ADD CONSTRAINT "staged_engagement_impacts_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "staged_engagement_impacts" ADD CONSTRAINT "staged_engagement_impacts_staged_engagement_id_staged_engagements_id_fk" FOREIGN KEY ("staged_engagement_id") REFERENCES "public"."staged_engagements"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "staged_engagement_impacts_engagement_idx" ON "staged_engagement_impacts" USING btree ("engagement_id");
  CREATE INDEX "staged_engagement_impacts_staged_engagement_idx" ON "staged_engagement_impacts" USING btree ("staged_engagement_id");
  ALTER TABLE "staged_engagement_impacts" DROP COLUMN "context_kind";
  DROP TYPE "public"."enum_staged_engagement_impacts_context_kind";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_staged_engagement_impacts_context_kind" AS ENUM('event', 'program');
  CREATE TABLE "staged_engagement_impacts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"programs_id" integer
  );
  
  ALTER TABLE "staged_engagement_impacts" DROP CONSTRAINT "staged_engagement_impacts_engagement_id_engagements_id_fk";
  
  ALTER TABLE "staged_engagement_impacts" DROP CONSTRAINT "staged_engagement_impacts_staged_engagement_id_staged_engagements_id_fk";
  
  DROP INDEX "staged_engagement_impacts_engagement_idx";
  DROP INDEX "staged_engagement_impacts_staged_engagement_idx";
  ALTER TABLE "staged_engagement_impacts" ADD COLUMN "context_kind" "enum_staged_engagement_impacts_context_kind" NOT NULL;
  ALTER TABLE "staged_engagement_impacts_rels" ADD CONSTRAINT "staged_engagement_impacts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."staged_engagement_impacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staged_engagement_impacts_rels" ADD CONSTRAINT "staged_engagement_impacts_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "staged_engagement_impacts_rels" ADD CONSTRAINT "staged_engagement_impacts_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "staged_engagement_impacts_rels_order_idx" ON "staged_engagement_impacts_rels" USING btree ("order");
  CREATE INDEX "staged_engagement_impacts_rels_parent_idx" ON "staged_engagement_impacts_rels" USING btree ("parent_id");
  CREATE INDEX "staged_engagement_impacts_rels_path_idx" ON "staged_engagement_impacts_rels" USING btree ("path");
  CREATE INDEX "staged_engagement_impacts_rels_events_id_idx" ON "staged_engagement_impacts_rels" USING btree ("events_id");
  CREATE INDEX "staged_engagement_impacts_rels_programs_id_idx" ON "staged_engagement_impacts_rels" USING btree ("programs_id");
  CREATE INDEX "staged_engagement_impacts_context_kind_idx" ON "staged_engagement_impacts" USING btree ("context_kind");
  ALTER TABLE "staged_engagement_impacts" DROP COLUMN "engagement_id";
  ALTER TABLE "staged_engagement_impacts" DROP COLUMN "staged_engagement_id";`)
}
