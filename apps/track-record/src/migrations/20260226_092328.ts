import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "staged_engagements" ADD COLUMN "current_value" jsonb;
  ALTER TABLE "staged_engagement_removals" ADD COLUMN "current_value" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "staged_engagements" DROP COLUMN "current_value";
  ALTER TABLE "staged_engagement_removals" DROP COLUMN "current_value";`)
}
