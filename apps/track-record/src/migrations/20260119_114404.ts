import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "programs_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"is_highlighted" boolean DEFAULT false,
  	"caption" varchar
  );
  
  CREATE TABLE "cohorts_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"is_highlighted" boolean DEFAULT false,
  	"caption" varchar
  );
  
  CREATE TABLE "events_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"is_highlighted" boolean DEFAULT false,
  	"caption" varchar
  );
  
  ALTER TABLE "programs_images" ADD CONSTRAINT "programs_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programs_images" ADD CONSTRAINT "programs_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cohorts_images" ADD CONSTRAINT "cohorts_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cohorts_images" ADD CONSTRAINT "cohorts_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_images" ADD CONSTRAINT "events_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_images" ADD CONSTRAINT "events_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programs_images_order_idx" ON "programs_images" USING btree ("_order");
  CREATE INDEX "programs_images_parent_id_idx" ON "programs_images" USING btree ("_parent_id");
  CREATE INDEX "programs_images_image_idx" ON "programs_images" USING btree ("image_id");
  CREATE INDEX "cohorts_images_order_idx" ON "cohorts_images" USING btree ("_order");
  CREATE INDEX "cohorts_images_parent_id_idx" ON "cohorts_images" USING btree ("_parent_id");
  CREATE INDEX "cohorts_images_image_idx" ON "cohorts_images" USING btree ("image_id");
  CREATE INDEX "events_images_order_idx" ON "events_images" USING btree ("_order");
  CREATE INDEX "events_images_parent_id_idx" ON "events_images" USING btree ("_parent_id");
  CREATE INDEX "events_images_image_idx" ON "events_images" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "programs_images" CASCADE;
  DROP TABLE "cohorts_images" CASCADE;
  DROP TABLE "events_images" CASCADE;`)
}
