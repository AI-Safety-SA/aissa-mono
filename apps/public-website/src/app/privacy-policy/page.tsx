import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal-document-page";

export const metadata: Metadata = {
  title: "Privacy and Data Policy | AI Safety South Africa",
  description: "Privacy and data policy for AI Safety South Africa.",
};

const PRIVACY_POLICY_URL =
  "https://aisafetysa.getoutline.com/s/420333c7-c8fe-406e-b35f-7303bc3a7962";

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      documentTitle="AI Safety SA Privacy and Data Policy"
      documentUrl={PRIVACY_POLICY_URL}
      eyebrow="Legal"
      title="AI Safety SA Privacy and Data Policy"
      description="The privacy and data policy for AI Safety South Africa details how we collect, use, protect, and retain personal information. If you wish to lodge a complaint or make a suggestion, please reach out to us at infrastructure@aisafetysa.com."
    />
  );
}
