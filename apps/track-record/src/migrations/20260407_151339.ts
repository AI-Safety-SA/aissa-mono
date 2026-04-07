import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs" DROP CONSTRAINT "programs_partnership_id_partnerships_id_fk";
  
  DROP INDEX "programs_partnership_idx";
  ALTER TABLE "organisations" ADD COLUMN "logo_id" integer;
  ALTER TABLE "partnerships" ADD COLUMN "program_id" integer;
  WITH ranked_partnership_programs AS (
    SELECT
      "partnerships"."id" AS "partnership_id",
      "programs"."id" AS "program_id",
      row_number() OVER (
        PARTITION BY "partnerships"."id"
        ORDER BY "programs"."id"
      ) AS "rank"
    FROM "partnerships"
    JOIN "programs" ON "programs"."partnership_id" = "partnerships"."id"
  ),
  updated_partnerships AS (
    UPDATE "partnerships"
    SET "program_id" = "ranked_partnership_programs"."program_id"
    FROM "ranked_partnership_programs"
    WHERE
      "partnerships"."id" = "ranked_partnership_programs"."partnership_id"
      AND "ranked_partnership_programs"."rank" = 1
    RETURNING "partnerships"."id"
  )
  INSERT INTO "partnerships" (
    "organisation_id",
    "type",
    "description",
    "start_date",
    "end_date",
    "is_active",
    "updated_at",
    "created_at",
    "program_id"
  )
  SELECT
    "partnerships"."organisation_id",
    "partnerships"."type",
    "partnerships"."description",
    "partnerships"."start_date",
    "partnerships"."end_date",
    "partnerships"."is_active",
    "partnerships"."updated_at",
    "partnerships"."created_at",
    "ranked_partnership_programs"."program_id"
  FROM "partnerships"
  JOIN "ranked_partnership_programs"
    ON "ranked_partnership_programs"."partnership_id" = "partnerships"."id"
  WHERE "ranked_partnership_programs"."rank" > 1;
  DELETE FROM "partnerships" WHERE "program_id" IS NULL;
  ALTER TABLE "partnerships" ALTER COLUMN "program_id" SET NOT NULL;
  ALTER TABLE "organisations" ADD CONSTRAINT "organisations_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "organisations_logo_idx" ON "organisations" USING btree ("logo_id");
  CREATE INDEX "partnerships_program_idx" ON "partnerships" USING btree ("program_id");
  CREATE UNIQUE INDEX "program_organisation_idx" ON "partnerships" USING btree ("program_id","organisation_id");
  ALTER TABLE "programs" DROP COLUMN "partnership_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "organisations" DROP CONSTRAINT "organisations_logo_id_media_id_fk";
  
  ALTER TABLE "partnerships" DROP CONSTRAINT "partnerships_program_id_programs_id_fk";
  
  DROP INDEX "organisations_logo_idx";
  DROP INDEX "partnerships_program_idx";
  DROP INDEX "program_organisation_idx";
  ALTER TABLE "programs" ADD COLUMN "partnership_id" integer;
  UPDATE "programs"
  SET "partnership_id" = (
    SELECT MIN("partnerships"."id")
    FROM "partnerships"
    WHERE "partnerships"."program_id" = "programs"."id"
  );
  ALTER TABLE "programs" ADD CONSTRAINT "programs_partnership_id_partnerships_id_fk" FOREIGN KEY ("partnership_id") REFERENCES "public"."partnerships"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "programs_partnership_idx" ON "programs" USING btree ("partnership_id");
  ALTER TABLE "organisations" DROP COLUMN "logo_id";
  ALTER TABLE "partnerships" DROP COLUMN "program_id";`)
}
