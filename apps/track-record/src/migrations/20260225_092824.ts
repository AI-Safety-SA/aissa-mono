import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_research_venue_type" AS ENUM('journal', 'conference', 'workshop', 'preprint');
  CREATE TYPE "public"."enum_research_status" AS ENUM('draft', 'submitted', 'accepted', 'published');
  CREATE TABLE "research_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"person_id" integer,
  	"name" varchar
  );
  
  CREATE TABLE "research_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar NOT NULL
  );
  
  CREATE TABLE "research" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"abstract" varchar,
  	"arxiv_link" varchar,
  	"accepted_venue" varchar,
  	"venue_type" "enum_research_venue_type",
  	"publication_date" timestamp(3) with time zone,
  	"doi" varchar,
  	"related_project_id" integer,
  	"status" "enum_research_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "research_id" integer;
  ALTER TABLE "research_authors" ADD CONSTRAINT "research_authors_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "research_authors" ADD CONSTRAINT "research_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research_keywords" ADD CONSTRAINT "research_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research" ADD CONSTRAINT "research_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "research_authors_order_idx" ON "research_authors" USING btree ("_order");
  CREATE INDEX "research_authors_parent_id_idx" ON "research_authors" USING btree ("_parent_id");
  CREATE INDEX "research_authors_person_idx" ON "research_authors" USING btree ("person_id");
  CREATE INDEX "research_keywords_order_idx" ON "research_keywords" USING btree ("_order");
  CREATE INDEX "research_keywords_parent_id_idx" ON "research_keywords" USING btree ("_parent_id");
  CREATE INDEX "research_related_project_idx" ON "research" USING btree ("related_project_id");
  CREATE INDEX "research_updated_at_idx" ON "research" USING btree ("updated_at");
  CREATE INDEX "research_created_at_idx" ON "research" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_research_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_research_id_idx" ON "payload_locked_documents_rels" USING btree ("research_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "research_authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "research_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "research" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "research_authors" CASCADE;
  DROP TABLE "research_keywords" CASCADE;
  DROP TABLE "research" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_research_fk";
  
  DROP INDEX "payload_locked_documents_rels_research_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "research_id";
  DROP TYPE "public"."enum_research_venue_type";
  DROP TYPE "public"."enum_research_status";`)
}
