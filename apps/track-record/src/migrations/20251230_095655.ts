import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_engagements_type" ADD VALUE 'other';
  ALTER TABLE "engagements" ADD COLUMN "metadata" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "engagements" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_engagements_type";
  CREATE TYPE "public"."enum_engagements_type" AS ENUM('participant', 'facilitator', 'speaker', 'volunteer', 'organizer', 'mentor');
  ALTER TABLE "engagements" ALTER COLUMN "type" SET DATA TYPE "public"."enum_engagements_type" USING "type"::"public"."enum_engagements_type";
  ALTER TABLE "engagements" DROP COLUMN "metadata";`)
}
