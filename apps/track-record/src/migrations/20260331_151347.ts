import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "default_images" ADD COLUMN "event_type_defaults_seminar_image_id" integer;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_event_type_defaults_seminar_image_id_media_id_fk" FOREIGN KEY ("event_type_defaults_seminar_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "default_images_event_type_defaults_event_type_defaults_s_idx" ON "default_images" USING btree ("event_type_defaults_seminar_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "default_images" DROP CONSTRAINT "default_images_event_type_defaults_seminar_image_id_media_id_fk";
  
  DROP INDEX "default_images_event_type_defaults_event_type_defaults_s_idx";
  ALTER TABLE "default_images" DROP COLUMN "event_type_defaults_seminar_image_id";`)
}
