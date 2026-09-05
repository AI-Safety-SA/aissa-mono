import type { ReactElement } from "react";
import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal-document-page";

export const metadata: Metadata = {
  title: "Privacy and Data Policy | AI Safety South Africa",
  description: "Privacy and data policy for AI Safety South Africa.",
};

const PRIVACY_POLICY_URL =
  "https://sage-creature-2af.notion.site/CISAI-AISSA-Privacy-Data-Policy-37bdf66d372281778292d5daeaa97d45";

export default function PrivacyPolicyPage(): ReactElement {
  return (
    <LegalDocumentPage
      documentTitle="AI Safety SA Privacy and Data Policy"
      documentUrl={PRIVACY_POLICY_URL}
      display="link"
      eyebrow="Legal"
      title="AI Safety SA Privacy and Data Policy"
      description="The privacy and data policy for AI Safety South Africa details how we collect, use, protect, and retain personal information. If you wish to lodge a complaint or make a suggestion, please reach out to us at infrastructure@aisafetysa.com."
    />
  );
}
