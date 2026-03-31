import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "staged_engagements" ADD COLUMN "context_name" varchar;
  ALTER TABLE "staged_testimonials" ADD COLUMN "context_name" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "staged_engagements" DROP COLUMN "context_name";
  ALTER TABLE "staged_testimonials" DROP COLUMN "context_name";`)
}
