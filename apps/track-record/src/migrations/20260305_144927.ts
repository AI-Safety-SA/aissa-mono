import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "community_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"linkedin_followers" numeric DEFAULT 0,
  	"substack_subscribers" numeric DEFAULT 0,
  	"luma_subscribers" numeric DEFAULT 0,
  	"x_followers" numeric DEFAULT 0,
  	"whatsapp_community_size" numeric DEFAULT 0,
  	"slack_members" numeric DEFAULT 0,
  	"coworking_seats" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "research" ADD COLUMN "is_published" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "community_stats" CASCADE;
  ALTER TABLE "research" DROP COLUMN "is_published";`)
}
