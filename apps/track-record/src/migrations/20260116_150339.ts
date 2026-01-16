import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs" ADD COLUMN "application_count" numeric;
  ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT 'media';
  ALTER TABLE "cohorts" DROP COLUMN "application_count";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cohorts" ADD COLUMN "application_count" numeric;
  ALTER TABLE "programs" DROP COLUMN "application_count";
  ALTER TABLE "media" DROP COLUMN "prefix";`)
}
