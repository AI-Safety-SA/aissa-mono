import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_programs_type" ADD VALUE 'retreat' BEFORE 'other';
  DROP INDEX "default_images_program_type_defaults_program_type_defa_5_idx";
  ALTER TABLE "programs" ADD COLUMN "participant_count" numeric;
  ALTER TABLE "programs" ADD COLUMN "show_on_public_website" boolean DEFAULT false;
  ALTER TABLE "programs" ADD COLUMN "highlight_on_public_website" boolean DEFAULT false;
  ALTER TABLE "programs" ADD COLUMN "highlight_priority" numeric;
  ALTER TABLE "programs" ADD COLUMN "website_url" varchar;
  ALTER TABLE "default_images" ADD COLUMN "program_type_defaults_retreat_image_id" integer;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_program_type_defaults_retreat_image_id_media_id_fk" FOREIGN KEY ("program_type_defaults_retreat_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "default_images_program_type_defaults_program_type_defa_6_idx" ON "default_images" USING btree ("program_type_defaults_other_program_image_id");
  CREATE INDEX "default_images_program_type_defaults_program_type_defa_5_idx" ON "default_images" USING btree ("program_type_defaults_retreat_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "default_images" DROP CONSTRAINT "default_images_program_type_defaults_retreat_image_id_media_id_fk";

  ALTER TABLE "programs" ALTER COLUMN "type" SET DATA TYPE text;
  UPDATE "programs" SET "type" = 'other' WHERE "type" = 'retreat';
  DROP TYPE "public"."enum_programs_type";
  CREATE TYPE "public"."enum_programs_type" AS ENUM('fellowship', 'course', 'hackathon', 'coworking', 'volunteer_program', 'other');
  ALTER TABLE "programs" ALTER COLUMN "type" SET DATA TYPE "public"."enum_programs_type" USING "type"::"public"."enum_programs_type";
  DROP INDEX "default_images_program_type_defaults_program_type_defa_6_idx";
  DROP INDEX "default_images_program_type_defaults_program_type_defa_5_idx";
  CREATE INDEX "default_images_program_type_defaults_program_type_defa_5_idx" ON "default_images" USING btree ("program_type_defaults_other_program_image_id");
  ALTER TABLE "programs" DROP COLUMN "participant_count";
  ALTER TABLE "programs" DROP COLUMN "show_on_public_website";
  ALTER TABLE "programs" DROP COLUMN "highlight_on_public_website";
  ALTER TABLE "programs" DROP COLUMN "highlight_priority";
  ALTER TABLE "programs" DROP COLUMN "website_url";
  ALTER TABLE "default_images" DROP COLUMN "program_type_defaults_retreat_image_id";`)
}
