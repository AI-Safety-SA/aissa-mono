import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "feedback_submissions" DROP CONSTRAINT "feedback_submissions_engagement_id_engagements_id_fk";
  
  DROP INDEX "feedback_submissions_engagement_idx";
  ALTER TABLE "feedback_submissions" DROP COLUMN "engagement_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "feedback_submissions" ADD COLUMN "engagement_id" integer;
  ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "feedback_submissions_engagement_idx" ON "feedback_submissions" USING btree ("engagement_id");`)
}
