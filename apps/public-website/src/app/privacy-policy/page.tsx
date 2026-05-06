import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Safety South Africa",
  description: "Privacy policy for AI Safety South Africa.",
};

const PRIVACY_POLICY_URL =
  "https://aisafetysa.getoutline.com/s/420333c7-c8fe-406e-b35f-7303bc3a7962";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-[calc(100vh-5rem)]">
      <section className="border-b py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Legal
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            AISSA Privacy Policy
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            The public privacy policy for AI Safety South Africa is published as
            a public document and remains available without Track Record access.
          </p>
          <a
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Open privacy policy
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
