import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_persons_featured_tier" AS ENUM('top', 'team', 'other');
  CREATE TABLE "persons_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"engagement_impacts_id" integer
  );
  
  ALTER TABLE "persons" ADD COLUMN "featured_tier" "enum_persons_featured_tier";
  ALTER TABLE "persons" ADD COLUMN "featured_priority" numeric;
  ALTER TABLE "persons_rels" ADD CONSTRAINT "persons_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "persons_rels" ADD CONSTRAINT "persons_rels_engagement_impacts_fk" FOREIGN KEY ("engagement_impacts_id") REFERENCES "public"."engagement_impacts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "persons_rels_order_idx" ON "persons_rels" USING btree ("order");
  CREATE INDEX "persons_rels_parent_idx" ON "persons_rels" USING btree ("parent_id");
  CREATE INDEX "persons_rels_path_idx" ON "persons_rels" USING btree ("path");
  CREATE INDEX "persons_rels_engagement_impacts_id_idx" ON "persons_rels" USING btree ("engagement_impacts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "persons_rels" CASCADE;
  ALTER TABLE "persons" DROP COLUMN "featured_tier";
  ALTER TABLE "persons" DROP COLUMN "featured_priority";
  DROP TYPE "public"."enum_persons_featured_tier";`)
}
