import type { ReactElement } from "react";
import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal-document-page";

export const metadata: Metadata = {
  title: "Code of Conduct | AI Safety South Africa",
  description: "AI Safety South Africa community code of conduct.",
};

const CODE_OF_CONDUCT_URL =
  "https://aisafetysa.getoutline.com/s/aa885466-1262-41f1-8f3d-e3b02d701539";

export default function CodeOfConductPage(): ReactElement {
  return (
    <LegalDocumentPage
      documentTitle="AI Safety SA Code of Conduct"
      documentUrl={CODE_OF_CONDUCT_URL}
      eyebrow="Legal"
      title="AI Safety SA Code of Conduct"
      description="Our code of conduct exists to make our spaces and programming safe and equitable for all. Visitors to AI Safety SA spaces are expected to abide by this code of conduct. To lodge a report or make a suggestion, please follow the steps outlined in the code of conduct, or reach out to admin@aisafetysa.com."
    />
  );
}
