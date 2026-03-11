import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_community_submissions_deletion_request_mode" AS ENUM('continue', 'exit');
  CREATE TYPE "public"."enum_community_submissions_deletion_review_status" AS ENUM('not_requested', 'pending', 'approved', 'rejected');
  ALTER TABLE "community_submissions" ADD COLUMN "display_to_funders_consent_requested" boolean DEFAULT false;
  ALTER TABLE "community_submissions" ADD COLUMN "share_with_partners_consent_requested" boolean DEFAULT false;
  ALTER TABLE "community_submissions" ADD COLUMN "deletion_requested" boolean DEFAULT false;
  ALTER TABLE "community_submissions" ADD COLUMN "deletion_request_mode" "enum_community_submissions_deletion_request_mode";
  ALTER TABLE "community_submissions" ADD COLUMN "deletion_review_status" "enum_community_submissions_deletion_review_status" DEFAULT 'not_requested' NOT NULL;
  ALTER TABLE "community_submissions" ADD COLUMN "deletion_requested_at" timestamp(3) with time zone;
  ALTER TABLE "community_submissions" ADD COLUMN "deletion_review_notes" varchar;
  ALTER TABLE "community_submissions" ADD COLUMN "deletion_applied_at" timestamp(3) with time zone;
  ALTER TABLE "persons" ADD COLUMN "display_to_funders_consent" boolean DEFAULT false;
  ALTER TABLE "persons" ADD COLUMN "share_with_partners_consent" boolean DEFAULT false;
  ALTER TABLE "persons" ADD COLUMN "is_anonymized" boolean DEFAULT false;
  ALTER TABLE "persons" ADD COLUMN "anonymized_at" timestamp(3) with time zone;
  ALTER TABLE "persons" ADD COLUMN "anonymized_email_hash" varchar;
  CREATE INDEX "community_submissions_deletion_requested_idx" ON "community_submissions" USING btree ("deletion_requested");
  CREATE INDEX "community_submissions_deletion_review_status_idx" ON "community_submissions" USING btree ("deletion_review_status");
  CREATE INDEX "persons_is_anonymized_idx" ON "persons" USING btree ("is_anonymized");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "community_submissions_deletion_requested_idx";
  DROP INDEX "community_submissions_deletion_review_status_idx";
  DROP INDEX "persons_is_anonymized_idx";
  ALTER TABLE "community_submissions" DROP COLUMN "display_to_funders_consent_requested";
  ALTER TABLE "community_submissions" DROP COLUMN "share_with_partners_consent_requested";
  ALTER TABLE "community_submissions" DROP COLUMN "deletion_requested";
  ALTER TABLE "community_submissions" DROP COLUMN "deletion_request_mode";
  ALTER TABLE "community_submissions" DROP COLUMN "deletion_review_status";
  ALTER TABLE "community_submissions" DROP COLUMN "deletion_requested_at";
  ALTER TABLE "community_submissions" DROP COLUMN "deletion_review_notes";
  ALTER TABLE "community_submissions" DROP COLUMN "deletion_applied_at";
  ALTER TABLE "persons" DROP COLUMN "display_to_funders_consent";
  ALTER TABLE "persons" DROP COLUMN "share_with_partners_consent";
  ALTER TABLE "persons" DROP COLUMN "is_anonymized";
  ALTER TABLE "persons" DROP COLUMN "anonymized_at";
  ALTER TABLE "persons" DROP COLUMN "anonymized_email_hash";
  DROP TYPE "public"."enum_community_submissions_deletion_request_mode";
  DROP TYPE "public"."enum_community_submissions_deletion_review_status";`)
}
