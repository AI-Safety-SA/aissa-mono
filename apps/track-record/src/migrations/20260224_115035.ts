import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_tier" AS ENUM('gold', 'silver', 'bronze');
  ALTER TABLE "projects" ADD COLUMN "tier" "enum_projects_tier";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN "tier";
  DROP TYPE "public"."enum_projects_tier";`)
}
