import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "grant_persons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"grant_id" integer NOT NULL,
  	"person_id" integer NOT NULL,
  	"role" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "grant_persons_id" integer;
  ALTER TABLE "grant_persons" ADD CONSTRAINT "grant_persons_grant_id_grants_id_fk" FOREIGN KEY ("grant_id") REFERENCES "public"."grants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "grant_persons" ADD CONSTRAINT "grant_persons_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "grant_persons_grant_idx" ON "grant_persons" USING btree ("grant_id");
  CREATE INDEX "grant_persons_person_idx" ON "grant_persons" USING btree ("person_id");
  CREATE INDEX "grant_persons_updated_at_idx" ON "grant_persons" USING btree ("updated_at");
  CREATE INDEX "grant_persons_created_at_idx" ON "grant_persons" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_grant_persons_fk" FOREIGN KEY ("grant_persons_id") REFERENCES "public"."grant_persons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_grant_persons_id_idx" ON "payload_locked_documents_rels" USING btree ("grant_persons_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "grant_persons" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "grant_persons" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_grant_persons_fk";
  
  DROP INDEX "payload_locked_documents_rels_grant_persons_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "grant_persons_id";`)
}
