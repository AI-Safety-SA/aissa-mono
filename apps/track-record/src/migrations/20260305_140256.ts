import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_grants_currency" ADD VALUE 'GBP';
  ALTER TABLE "grants" RENAME COLUMN "amount" TO "dollar_amount";
  ALTER TABLE "grants" RENAME COLUMN "date_awarded" TO "grant_period_start";
  ALTER TABLE "grants" ADD COLUMN "currency_amount" numeric;
  ALTER TABLE "grants" ADD COLUMN "grant_period_end" timestamp(3) with time zone;
  ALTER TABLE "grants" ADD COLUMN "aissa_grant_owner_id" integer;
  ALTER TABLE "grants" ADD COLUMN "is_published" boolean DEFAULT false;
  ALTER TABLE "grants" ADD CONSTRAINT "grants_aissa_grant_owner_id_persons_id_fk" FOREIGN KEY ("aissa_grant_owner_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "grants_aissa_grant_owner_idx" ON "grants" USING btree ("aissa_grant_owner_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "grants" DROP CONSTRAINT "grants_aissa_grant_owner_id_persons_id_fk";
  
  ALTER TABLE "grants" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "grants" ALTER COLUMN "currency" SET DEFAULT 'ZAR'::text;
  DROP TYPE "public"."enum_grants_currency";
  CREATE TYPE "public"."enum_grants_currency" AS ENUM('USD', 'ZAR', 'EUR');
  ALTER TABLE "grants" ALTER COLUMN "currency" SET DEFAULT 'ZAR'::"public"."enum_grants_currency";
  ALTER TABLE "grants" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_grants_currency" USING "currency"::"public"."enum_grants_currency";
  DROP INDEX "grants_aissa_grant_owner_idx";
  ALTER TABLE "grants" ADD COLUMN "amount" numeric NOT NULL;
  ALTER TABLE "grants" ADD COLUMN "date_awarded" timestamp(3) with time zone;
  ALTER TABLE "grants" DROP COLUMN "dollar_amount";
  ALTER TABLE "grants" DROP COLUMN "currency_amount";
  ALTER TABLE "grants" DROP COLUMN "grant_period_start";
  ALTER TABLE "grants" DROP COLUMN "grant_period_end";
  ALTER TABLE "grants" DROP COLUMN "aissa_grant_owner_id";
  ALTER TABLE "grants" DROP COLUMN "is_published";`)
}
