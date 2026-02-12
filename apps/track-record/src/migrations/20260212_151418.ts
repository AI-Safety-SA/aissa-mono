import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "persons" ADD COLUMN "person_tag" varchar DEFAULT 'Community Member';
  ALTER TABLE "persons" ADD COLUMN "organisation" varchar;
  ALTER TABLE "persons" ADD COLUMN "total_contributions" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "persons" DROP COLUMN "person_tag";
  ALTER TABLE "persons" DROP COLUMN "organisation";
  ALTER TABLE "persons" DROP COLUMN "total_contributions";`)
}
