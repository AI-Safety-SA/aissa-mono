import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programs" DROP CONSTRAINT "programs_partnership_id_partnerships_id_fk";
  
  DROP INDEX "programs_partnership_idx";
  ALTER TABLE "organisations" ADD COLUMN "logo_id" integer;
  ALTER TABLE "partnerships" ADD COLUMN "program_id" integer NOT NULL;
  ALTER TABLE "organisations" ADD CONSTRAINT "organisations_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "organisations_logo_idx" ON "organisations" USING btree ("logo_id");
  CREATE INDEX "partnerships_program_idx" ON "partnerships" USING btree ("program_id");
  ALTER TABLE "programs" DROP COLUMN "partnership_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "organisations" DROP CONSTRAINT "organisations_logo_id_media_id_fk";
  
  ALTER TABLE "partnerships" DROP CONSTRAINT "partnerships_program_id_programs_id_fk";
  
  DROP INDEX "organisations_logo_idx";
  DROP INDEX "partnerships_program_idx";
  ALTER TABLE "programs" ADD COLUMN "partnership_id" integer;
  ALTER TABLE "programs" ADD CONSTRAINT "programs_partnership_id_partnerships_id_fk" FOREIGN KEY ("partnership_id") REFERENCES "public"."partnerships"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "programs_partnership_idx" ON "programs" USING btree ("partnership_id");
  ALTER TABLE "organisations" DROP COLUMN "logo_id";
  ALTER TABLE "partnerships" DROP COLUMN "program_id";`)
}
