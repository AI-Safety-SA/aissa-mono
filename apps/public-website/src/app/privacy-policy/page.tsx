import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Safety South Africa",
  description: "Privacy policy for AI Safety South Africa.",
};

const PRIVACY_POLICY_URL =
  "https://aisafetysa.getoutline.com/s/420333c7-c8fe-406e-b35f-7303bc3a7962";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-[calc(100vh-5rem)]">
      <section className="pt-16 pb-8">
        <div className="container mx-auto max-w-4xl px-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Legal
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            AISSA Privacy Policy
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            The privacy policy for AI Safety South Africa details how we
            collect, use, protect, and retain personal information. If you wish
            to lodge a complaint or make a suggestion, please reach out to us at
            infrastructure@aisafetysa.com.
          </p>
        </div>
      </section>
      <section className="container mx-auto px-4 pb-8">
        <iframe
          src={PRIVACY_POLICY_URL}
          title="AISSA Privacy Policy"
          sandbox="allow-same-origin allow-scripts"
          className="h-[78vh] min-h-[640px] w-full rounded-lg border border-border bg-background"
        />
      </section>
    </main>
  );
}
