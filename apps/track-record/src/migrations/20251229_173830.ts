import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_organisations_type" AS ENUM('university', 'corporate', 'nonprofit', 'government');
  CREATE TYPE "public"."enum_partnerships_type" AS ENUM('venue', 'funding', 'collaboration', 'media');
  CREATE TYPE "public"."enum_programs_type" AS ENUM('fellowship', 'course', 'coworking', 'volunteer_program');
  CREATE TYPE "public"."enum_events_type" AS ENUM('workshop', 'talk', 'meetup', 'reading_group', 'retreat', 'panel');
  CREATE TYPE "public"."enum_projects_type" AS ENUM('research_paper', 'bounty_submission', 'grant_award', 'software_tool');
  CREATE TYPE "public"."enum_projects_project_status" AS ENUM('in_progress', 'submitted', 'accepted', 'published');
  CREATE TYPE "public"."enum_project_contributors_role" AS ENUM('lead_author', 'co_author', 'contributor', 'advisor');
  CREATE TYPE "public"."enum_engagements_type" AS ENUM('participant', 'facilitator', 'speaker', 'volunteer', 'organizer', 'mentor');
  CREATE TYPE "public"."enum_engagements_engagement_status" AS ENUM('completed', 'dropped_out', 'in_progress', 'withdrawn', 'attended');
  CREATE TYPE "public"."enum_engagement_impacts_type" AS ENUM('career_transition', 'research_contribution', 'community_building', 'grant_awarded', 'publication', 'educational', 'community');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "persons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"full_name" varchar NOT NULL,
  	"preferred_name" varchar,
  	"bio" varchar,
  	"website_url" varchar,
  	"headshot_id" integer,
  	"joined_at" timestamp(3) with time zone NOT NULL,
  	"is_published" boolean DEFAULT false,
  	"highlight" boolean DEFAULT false,
  	"featured_story" jsonb,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "organisations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_organisations_type",
  	"website" varchar,
  	"description" varchar,
  	"is_partnership_active" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partnerships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organisation_id" integer NOT NULL,
  	"type" "enum_partnerships_type" NOT NULL,
  	"description" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "programs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_programs_type" NOT NULL,
  	"partnership_id" integer,
  	"description" jsonb,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"is_published" boolean DEFAULT false,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cohorts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"program_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"application_count" numeric,
  	"accepted_count" numeric,
  	"completion_count" numeric,
  	"completion_rate" numeric,
  	"average_rating" numeric,
  	"dropout_rate" numeric,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"is_published" boolean DEFAULT false,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_events_type" NOT NULL,
  	"organiser_id" integer NOT NULL,
  	"event_date" timestamp(3) with time zone NOT NULL,
  	"attendance_count" numeric,
  	"location" varchar,
  	"is_published" boolean DEFAULT false,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_projects_type" NOT NULL,
  	"project_status" "enum_projects_project_status" DEFAULT 'in_progress',
  	"program_id" integer,
  	"link_url" varchar,
  	"repository_url" varchar,
  	"is_published" boolean DEFAULT false,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "event_hosts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"person_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "project_contributors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_id" integer NOT NULL,
  	"person_id" integer NOT NULL,
  	"role" "enum_project_contributors_role" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "engagements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"person_id" integer NOT NULL,
  	"type" "enum_engagements_type" NOT NULL,
  	"event_id" integer,
  	"program_id" integer,
  	"cohort_id" integer,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"rating" numeric,
  	"would_recommend" numeric,
  	"engagement_status" "enum_engagements_engagement_status",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "engagement_impacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"person_id" integer NOT NULL,
  	"engagement_id" integer,
  	"affiliated_organisation_id" integer,
  	"type" "enum_engagement_impacts_type" NOT NULL,
  	"summary" varchar NOT NULL,
  	"evidence_url" varchar,
  	"is_verified" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"person_id" integer NOT NULL,
  	"program_id" integer,
  	"event_id" integer,
  	"cohort_id" integer,
  	"quote" varchar NOT NULL,
  	"attribution_name" varchar,
  	"attribution_title" varchar,
  	"rating" numeric,
  	"is_published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"persons_id" integer,
  	"organisations_id" integer,
  	"partnerships_id" integer,
  	"programs_id" integer,
  	"cohorts_id" integer,
  	"events_id" integer,
  	"projects_id" integer,
  	"event_hosts_id" integer,
  	"project_contributors_id" integer,
  	"engagements_id" integer,
  	"engagement_impacts_id" integer,
  	"testimonials_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "persons" ADD CONSTRAINT "persons_headshot_id_media_id_fk" FOREIGN KEY ("headshot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programs" ADD CONSTRAINT "programs_partnership_id_partnerships_id_fk" FOREIGN KEY ("partnership_id") REFERENCES "public"."partnerships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_organiser_id_persons_id_fk" FOREIGN KEY ("organiser_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_hosts" ADD CONSTRAINT "event_hosts_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_hosts" ADD CONSTRAINT "event_hosts_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_contributors" ADD CONSTRAINT "project_contributors_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_contributors" ADD CONSTRAINT "project_contributors_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagements" ADD CONSTRAINT "engagements_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagement_impacts" ADD CONSTRAINT "engagement_impacts_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagement_impacts" ADD CONSTRAINT "engagement_impacts_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "engagement_impacts" ADD CONSTRAINT "engagement_impacts_affiliated_organisation_id_organisations_id_fk" FOREIGN KEY ("affiliated_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_persons_fk" FOREIGN KEY ("persons_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organisations_fk" FOREIGN KEY ("organisations_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partnerships_fk" FOREIGN KEY ("partnerships_id") REFERENCES "public"."partnerships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cohorts_fk" FOREIGN KEY ("cohorts_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_hosts_fk" FOREIGN KEY ("event_hosts_id") REFERENCES "public"."event_hosts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_contributors_fk" FOREIGN KEY ("project_contributors_id") REFERENCES "public"."project_contributors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_engagements_fk" FOREIGN KEY ("engagements_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_engagement_impacts_fk" FOREIGN KEY ("engagement_impacts_id") REFERENCES "public"."engagement_impacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "persons_email_idx" ON "persons" USING btree ("email");
  CREATE INDEX "persons_headshot_idx" ON "persons" USING btree ("headshot_id");
  CREATE INDEX "persons_updated_at_idx" ON "persons" USING btree ("updated_at");
  CREATE INDEX "persons_created_at_idx" ON "persons" USING btree ("created_at");
  CREATE INDEX "organisations_updated_at_idx" ON "organisations" USING btree ("updated_at");
  CREATE INDEX "organisations_created_at_idx" ON "organisations" USING btree ("created_at");
  CREATE INDEX "partnerships_organisation_idx" ON "partnerships" USING btree ("organisation_id");
  CREATE INDEX "partnerships_updated_at_idx" ON "partnerships" USING btree ("updated_at");
  CREATE INDEX "partnerships_created_at_idx" ON "partnerships" USING btree ("created_at");
  CREATE UNIQUE INDEX "programs_slug_idx" ON "programs" USING btree ("slug");
  CREATE INDEX "programs_partnership_idx" ON "programs" USING btree ("partnership_id");
  CREATE INDEX "programs_updated_at_idx" ON "programs" USING btree ("updated_at");
  CREATE INDEX "programs_created_at_idx" ON "programs" USING btree ("created_at");
  CREATE INDEX "cohorts_program_idx" ON "cohorts" USING btree ("program_id");
  CREATE UNIQUE INDEX "cohorts_slug_idx" ON "cohorts" USING btree ("slug");
  CREATE INDEX "cohorts_updated_at_idx" ON "cohorts" USING btree ("updated_at");
  CREATE INDEX "cohorts_created_at_idx" ON "cohorts" USING btree ("created_at");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_organiser_idx" ON "events" USING btree ("organiser_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_program_idx" ON "projects" USING btree ("program_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "event_hosts_event_idx" ON "event_hosts" USING btree ("event_id");
  CREATE INDEX "event_hosts_person_idx" ON "event_hosts" USING btree ("person_id");
  CREATE INDEX "event_hosts_updated_at_idx" ON "event_hosts" USING btree ("updated_at");
  CREATE INDEX "event_hosts_created_at_idx" ON "event_hosts" USING btree ("created_at");
  CREATE INDEX "project_contributors_project_idx" ON "project_contributors" USING btree ("project_id");
  CREATE INDEX "project_contributors_person_idx" ON "project_contributors" USING btree ("person_id");
  CREATE INDEX "project_contributors_updated_at_idx" ON "project_contributors" USING btree ("updated_at");
  CREATE INDEX "project_contributors_created_at_idx" ON "project_contributors" USING btree ("created_at");
  CREATE INDEX "engagements_person_idx" ON "engagements" USING btree ("person_id");
  CREATE INDEX "engagements_event_idx" ON "engagements" USING btree ("event_id");
  CREATE INDEX "engagements_program_idx" ON "engagements" USING btree ("program_id");
  CREATE INDEX "engagements_cohort_idx" ON "engagements" USING btree ("cohort_id");
  CREATE INDEX "engagements_updated_at_idx" ON "engagements" USING btree ("updated_at");
  CREATE INDEX "engagements_created_at_idx" ON "engagements" USING btree ("created_at");
  CREATE INDEX "engagement_impacts_person_idx" ON "engagement_impacts" USING btree ("person_id");
  CREATE INDEX "engagement_impacts_engagement_idx" ON "engagement_impacts" USING btree ("engagement_id");
  CREATE INDEX "engagement_impacts_affiliated_organisation_idx" ON "engagement_impacts" USING btree ("affiliated_organisation_id");
  CREATE INDEX "engagement_impacts_updated_at_idx" ON "engagement_impacts" USING btree ("updated_at");
  CREATE INDEX "engagement_impacts_created_at_idx" ON "engagement_impacts" USING btree ("created_at");
  CREATE INDEX "testimonials_person_idx" ON "testimonials" USING btree ("person_id");
  CREATE INDEX "testimonials_program_idx" ON "testimonials" USING btree ("program_id");
  CREATE INDEX "testimonials_event_idx" ON "testimonials" USING btree ("event_id");
  CREATE INDEX "testimonials_cohort_idx" ON "testimonials" USING btree ("cohort_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_persons_id_idx" ON "payload_locked_documents_rels" USING btree ("persons_id");
  CREATE INDEX "payload_locked_documents_rels_organisations_id_idx" ON "payload_locked_documents_rels" USING btree ("organisations_id");
  CREATE INDEX "payload_locked_documents_rels_partnerships_id_idx" ON "payload_locked_documents_rels" USING btree ("partnerships_id");
  CREATE INDEX "payload_locked_documents_rels_programs_id_idx" ON "payload_locked_documents_rels" USING btree ("programs_id");
  CREATE INDEX "payload_locked_documents_rels_cohorts_id_idx" ON "payload_locked_documents_rels" USING btree ("cohorts_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_event_hosts_id_idx" ON "payload_locked_documents_rels" USING btree ("event_hosts_id");
  CREATE INDEX "payload_locked_documents_rels_project_contributors_id_idx" ON "payload_locked_documents_rels" USING btree ("project_contributors_id");
  CREATE INDEX "payload_locked_documents_rels_engagements_id_idx" ON "payload_locked_documents_rels" USING btree ("engagements_id");
  CREATE INDEX "payload_locked_documents_rels_engagement_impacts_id_idx" ON "payload_locked_documents_rels" USING btree ("engagement_impacts_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "persons" CASCADE;
  DROP TABLE "organisations" CASCADE;
  DROP TABLE "partnerships" CASCADE;
  DROP TABLE "programs" CASCADE;
  DROP TABLE "cohorts" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "event_hosts" CASCADE;
  DROP TABLE "project_contributors" CASCADE;
  DROP TABLE "engagements" CASCADE;
  DROP TABLE "engagement_impacts" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_organisations_type";
  DROP TYPE "public"."enum_partnerships_type";
  DROP TYPE "public"."enum_programs_type";
  DROP TYPE "public"."enum_events_type";
  DROP TYPE "public"."enum_projects_type";
  DROP TYPE "public"."enum_projects_project_status";
  DROP TYPE "public"."enum_project_contributors_role";
  DROP TYPE "public"."enum_engagements_type";
  DROP TYPE "public"."enum_engagements_engagement_status";
  DROP TYPE "public"."enum_engagement_impacts_type";`)
}
