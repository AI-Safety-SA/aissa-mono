import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "default_images" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_type_defaults_workshop_image_id" integer,
  	"event_type_defaults_talk_image_id" integer,
  	"event_type_defaults_meetup_image_id" integer,
  	"event_type_defaults_reading_group_image_id" integer,
  	"event_type_defaults_retreat_image_id" integer,
  	"event_type_defaults_panel_image_id" integer,
  	"event_type_defaults_other_event_image_id" integer,
  	"program_type_defaults_fellowship_image_id" integer,
  	"program_type_defaults_course_image_id" integer,
  	"program_type_defaults_hackathon_image_id" integer,
  	"program_type_defaults_coworking_image_id" integer,
  	"program_type_defaults_volunteer_program_image_id" integer,
  	"program_type_defaults_other_program_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_event_type_defaults_workshop_image_id_media_id_fk" FOREIGN KEY ("event_type_defaults_workshop_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_event_type_defaults_talk_image_id_media_id_fk" FOREIGN KEY ("event_type_defaults_talk_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_event_type_defaults_meetup_image_id_media_id_fk" FOREIGN KEY ("event_type_defaults_meetup_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_event_type_defaults_reading_group_image_id_media_id_fk" FOREIGN KEY ("event_type_defaults_reading_group_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_event_type_defaults_retreat_image_id_media_id_fk" FOREIGN KEY ("event_type_defaults_retreat_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_event_type_defaults_panel_image_id_media_id_fk" FOREIGN KEY ("event_type_defaults_panel_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_event_type_defaults_other_event_image_id_media_id_fk" FOREIGN KEY ("event_type_defaults_other_event_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_program_type_defaults_fellowship_image_id_media_id_fk" FOREIGN KEY ("program_type_defaults_fellowship_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_program_type_defaults_course_image_id_media_id_fk" FOREIGN KEY ("program_type_defaults_course_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_program_type_defaults_hackathon_image_id_media_id_fk" FOREIGN KEY ("program_type_defaults_hackathon_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_program_type_defaults_coworking_image_id_media_id_fk" FOREIGN KEY ("program_type_defaults_coworking_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_program_type_defaults_volunteer_program_image_id_media_id_fk" FOREIGN KEY ("program_type_defaults_volunteer_program_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "default_images" ADD CONSTRAINT "default_images_program_type_defaults_other_program_image_id_media_id_fk" FOREIGN KEY ("program_type_defaults_other_program_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "default_images_event_type_defaults_event_type_defaults_w_idx" ON "default_images" USING btree ("event_type_defaults_workshop_image_id");
  CREATE INDEX "default_images_event_type_defaults_event_type_defaults_t_idx" ON "default_images" USING btree ("event_type_defaults_talk_image_id");
  CREATE INDEX "default_images_event_type_defaults_event_type_defaults_m_idx" ON "default_images" USING btree ("event_type_defaults_meetup_image_id");
  CREATE INDEX "default_images_event_type_defaults_event_type_defaults_r_idx" ON "default_images" USING btree ("event_type_defaults_reading_group_image_id");
  CREATE INDEX "default_images_event_type_defaults_event_type_defaults_1_idx" ON "default_images" USING btree ("event_type_defaults_retreat_image_id");
  CREATE INDEX "default_images_event_type_defaults_event_type_defaults_p_idx" ON "default_images" USING btree ("event_type_defaults_panel_image_id");
  CREATE INDEX "default_images_event_type_defaults_event_type_defaults_o_idx" ON "default_images" USING btree ("event_type_defaults_other_event_image_id");
  CREATE INDEX "default_images_program_type_defaults_program_type_defaul_idx" ON "default_images" USING btree ("program_type_defaults_fellowship_image_id");
  CREATE INDEX "default_images_program_type_defaults_program_type_defa_1_idx" ON "default_images" USING btree ("program_type_defaults_course_image_id");
  CREATE INDEX "default_images_program_type_defaults_program_type_defa_2_idx" ON "default_images" USING btree ("program_type_defaults_hackathon_image_id");
  CREATE INDEX "default_images_program_type_defaults_program_type_defa_3_idx" ON "default_images" USING btree ("program_type_defaults_coworking_image_id");
  CREATE INDEX "default_images_program_type_defaults_program_type_defa_4_idx" ON "default_images" USING btree ("program_type_defaults_volunteer_program_image_id");
  CREATE INDEX "default_images_program_type_defaults_program_type_defa_5_idx" ON "default_images" USING btree ("program_type_defaults_other_program_image_id");
  ALTER TABLE "media" DROP COLUMN "_key";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "default_images" CASCADE;
  ALTER TABLE "media" ADD COLUMN "_key" varchar;
  `)
}
