import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Safety South Africa",
  description: "Privacy policy for AI Safety South Africa.",
};

const PRIVACY_POLICY_URL =
  "https://aisafetysa.getoutline.com/s/420333c7-c8fe-406e-b35f-7303bc3a7962";

export default function PrivacyPolicyPage() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-col">
      <iframe
        src={PRIVACY_POLICY_URL}
        title="AISSA Privacy Policy"
        sandbox="allow-same-origin allow-scripts"
        className="flex-1 w-full border-0"
        style={{ minHeight: "calc(100vh - 5rem)" }}
        loading="lazy"
      ></iframe>
    </main>
  );
}
