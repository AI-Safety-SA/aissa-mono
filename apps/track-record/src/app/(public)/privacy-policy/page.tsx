import { PublicShell } from '@/components/public-shell'

export const metadata = {
  title: 'Privacy Policy — AISSA Track Record',
  description: 'Privacy policy for the AISSA Track Record platform.',
}

export default function PrivacyPolicyPage() {
  return (
    <PublicShell>
      <div className="mx-auto w-full max-w-3xl py-6">
        <header className="mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            AI Safety South Africa
          </p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 2026</p>
        </header>

        <div className="space-y-10 text-[0.95rem] leading-7">
          <p>
            AI Safety South Africa (AISSA) runs the Track Record platform to manage and display our
            community&apos;s programs, events, and impact. This policy explains what personal
            information we collect, why we collect it, and how you can control it.
          </p>

          {/* Who We Are */}
          <Section title="Who We Are">
            <p>
              AISSA is a South African non-profit organisation focused on building AI safety capacity.
              We run fellowships, courses, reading groups, hackathons, and other programs to help
              people contribute to making AI systems safer.
            </p>
            <p>
              The Track Record platform is our system for recording participation and reporting our
              collective impact to funders and partners. The platform is not publicly accessible;
              access is granted selectively to relevant funders and partners.
            </p>
            <p>
              AISSA is the responsible party (data controller) for the personal information described
              in this policy. This means we decide how and why your information is processed, and we
              are accountable for protecting it.
            </p>
            <p>
              <strong>Information Officer:</strong> Charl Botha, Systems &amp; Partnerships,
              contactable at{' '}
              <a href="mailto:infrastructure@aisafetysa.com" className="text-primary hover:underline">
                infrastructure@aisafetysa.com
              </a>
              . Our Information Officer is responsible for ensuring AISSA&apos;s compliance with
              POPIA. Please note that registration with the Information Regulator of South Africa is
              currently in progress and has not yet been completed.
            </p>
          </Section>

          {/* What Data We Collect */}
          <Section title="What Data We Collect">
            <Subsection title="Information You Give Us Directly">
              <p>When you participate in AISSA programs or events, we collect:</p>
              <ul>
                <li>
                  <strong>Name and contact details:</strong> Full name, preferred name, email address
                </li>
                <li>
                  <strong>Professional information:</strong> Organisation, role, website or portfolio
                  URL (optional)
                </li>
                <li>
                  <strong>Profile content:</strong> Bio, headshot (optional)
                </li>
                <li>
                  <strong>Program participation:</strong> Which events, courses, or programs you
                  attended or helped organise
                </li>
                <li>
                  <strong>Feedback:</strong> Survey responses, testimonials, and other feedback you
                  submit
                </li>
              </ul>
            </Subsection>

            <Subsection title="Information from Third Parties">
              <p>
                If you register for events through Luma or submit forms via Tally, we receive the
                data you provide there. We may also receive information from program partners about
                your participation in joint programs.
              </p>
            </Subsection>

            <Subsection title="Automatically Collected">
              <p>Our website collects standard technical data through cookies and similar technologies:</p>
              <ul>
                <li>Browser type and device information</li>
                <li>Pages visited and referring site</li>
                <li>Approximate location (country/city level, based on IP address)</li>
              </ul>
              <p>
                We do not store any of this information, nor do we use it for analytics. See the
                &ldquo;Cookies and tracking&rdquo; section below for details.
              </p>
            </Subsection>

            <Subsection title="What Happens if You Don't Provide Information">
              <p>
                Providing personal information is voluntary. However, if you choose not to provide
                certain details:
              </p>
              <ul>
                <li>We may be unable to register you for programs or events</li>
                <li>Your participation may not be recorded or displayed on Track Record</li>
                <li>You may not receive program updates or logistics information</li>
              </ul>
              <p>
                Optional fields (bio, headshot, website URL) can be left blank without affecting your
                ability to participate.
              </p>
            </Subsection>
          </Section>

          {/* Legal Basis */}
          <Section title="Legal Basis for Processing">
            <p>
              We process your personal information based on the following lawful grounds under the
              Protection of Personal Information Act (POPIA):
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-6 font-semibold text-foreground">Purpose</th>
                    <th className="text-left py-2 font-semibold text-foreground">Legal basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    [
                      'Running programs (registration, logistics, communication)',
                      'Legitimate interest / contractual necessity',
                    ],
                    [
                      'Recording your participation and sharing it selectively with funders/partners',
                      'Legitimate interest, with your right to opt out',
                    ],
                    [
                      'Sending marketing emails about future programs',
                      'Your consent (explicit opt-in)',
                    ],
                    [
                      'Analytics and website improvement',
                      'Legitimate interest, with cookie consent',
                    ],
                    [
                      'Responding to your requests or complaints',
                      'Legal obligation under POPIA',
                    ],
                    ['Long-term impact tracking', 'Legitimate interest'],
                  ].map(([purpose, basis]) => (
                    <tr key={purpose}>
                      <td className="py-2 pr-6 text-muted-foreground">{purpose}</td>
                      <td className="py-2 text-muted-foreground">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              Where we rely on your consent, you can withdraw it at any time by contacting us.
              Withdrawing consent does not affect the lawfulness of processing that happened before
              you withdrew it.
            </p>
          </Section>

          {/* How We Use Your Data */}
          <Section title="How We Use Your Data">
            <Subsection title="To Run Our Programs">
              <p>We use your contact details to:</p>
              <ul>
                <li>Send program updates and logistics information</li>
                <li>Process your participation in courses, fellowships, or events</li>
                <li>Send post-event surveys and follow-up questions</li>
              </ul>
              <p>
                You can opt out of any of these at any point via the link at the bottom of the email,
                or by contacting us.
              </p>
            </Subsection>

            <Subsection title="To Track and Report Impact">
              <p>The core purpose of Track Record is to document what AISSA accomplishes. This means:</p>
              <ul>
                <li>
                  Your participation in events, program cohorts, or projects will be counted and
                  recorded.
                </li>
                <li>
                  Testimonials and quotes you submit may be shared with relevant funders or partners
                  with your name if you consent, or anonymously.
                </li>
                <li>
                  Aggregate statistics (e.g., &ldquo;47 people completed AI Safety Fundamentals
                  course&rdquo;) help us demonstrate impact to funders and partners.
                </li>
              </ul>
              <p>
                The platform is not publicly accessible. Impact information is shared selectively and
                only with relevant funders and partners. Your data is never sold.
              </p>
              <p>
                You can opt out of named display at any time — your participation will still be
                recorded internally but your name will not be shared externally. Contact us to
                exercise this right. You also have the right to fully anonymise the existing
                information we have of you, which involves the complete removal of your profile from
                our data system and anonymisation of any existing involvement records.
              </p>
            </Subsection>

            <Subsection title="To Stay in Touch">
              <p>
                With your consent, we send emails about upcoming programs and opportunities. You can
                unsubscribe at any time via the link in each email, or by contacting us directly.
              </p>
            </Subsection>
          </Section>

          {/* Who Sees Your Data */}
          <Section title="Who Sees Your Data">
            <Subsection title="Restricted Platform Access">
              <p>
                The Track Record platform is not publicly accessible. Access is granted only to
                authorised AISSA staff, and selectively to relevant funders and partners under
                appropriate confidentiality arrangements. Your data is never sold or made publicly
                available.
              </p>
              <p>
                For selected individuals, with your consent, basic profile information (name, role,
                organisation) may be visible within the platform to authorised funders or partners.
                You can request to have this restricted or hidden at any time.
              </p>
            </Subsection>

            <Subsection title="Internal Access">
              <p>
                AISSA organisers and administrators can view full participant records to manage
                programs and generate impact reports. Access is restricted to authorised staff only
                and is reviewed regularly.
              </p>
            </Subsection>

            <Subsection title="Service Providers">
              <p>
                We use the following third-party providers, who process data on our behalf under data
                processing agreements:
              </p>
              <ul>
                <li>
                  <strong>Neon</strong> (PostgreSQL hosting) — database storage
                </li>
                <li>
                  <strong>Vercel</strong> — web hosting
                </li>
                <li>
                  <strong>UploadThing</strong> — file storage (headshots, event images)
                </li>
              </ul>
              <p>
                These providers process data only to deliver their services to us. We do not sell
                your data to any third party.
              </p>
            </Subsection>

            <Subsection title="Legal Requirements">
              <p>
                We may disclose data if required by South African law, or to protect our legal rights.
              </p>
            </Subsection>
          </Section>

          {/* International Data Transfers */}
          <Section title="International Data Transfers">
            <p>
              Some of our service providers (Neon, Vercel, UploadThing) store data on servers outside
              South Africa.
            </p>
            <p>We only transfer data internationally where:</p>
            <ul>
              <li>The receiving country has adequate data protection laws, or</li>
              <li>
                We have appropriate safeguards in place, such as standard contractual clauses or
                binding data processing agreements
              </li>
            </ul>
            <p>
              We select providers with strong data protection standards. Details of specific
              safeguards are available on request.
            </p>
          </Section>

          {/* Data Retention */}
          <Section title="How Long We Keep Data">
            <p>
              We retain participant records long-term because our mission involves tracking how AI
              safety capacity develops in our community over years. This supports longitudinal impact
              reporting to funders and partners.
            </p>
            <p>
              We conduct annual reviews of retained data and anonymise records where individual
              identification is no longer necessary for our purposes.
            </p>
            <p>
              If you request deletion, we will remove your personal details while retaining
              anonymised aggregate statistics (e.g., &ldquo;1 participant&rdquo; without identifying
              who).
            </p>
          </Section>

          {/* Your Rights */}
          <Section title="Your Rights">
            <p>Under POPIA, you have the right to:</p>
            <ul>
              <li>
                <strong>Access</strong> — Request a copy of the personal data we hold about you
              </li>
              <li>
                <strong>Correction</strong> — Ask us to correct inaccurate or incomplete information
              </li>
              <li>
                <strong>Deletion</strong> — Request that we delete your personal data
              </li>
              <li>
                <strong>Object</strong> — Object to processing that does not comply with POPIA
              </li>
              <li>
                <strong>Withdraw consent</strong> — Withdraw any consent you&apos;ve previously
                given, without affecting prior processing
              </li>
              <li>
                <strong>Portability</strong> — Request your data in a structured, machine-readable
                format
              </li>
              <li>
                <strong>Opt out of named sharing</strong> — Have your participation recorded without
                your name being shared with funders or partners
              </li>
              <li>
                <strong>Unsubscribe</strong> — Stop receiving marketing emails at any time
              </li>
            </ul>
            <p>
              To exercise any of these rights, email{' '}
              <a href="mailto:infrastructure@aisafetysa.com" className="text-primary hover:underline">
                infrastructure@aisafetysa.com
              </a>{' '}
              or contact any AISSA organiser directly. We will respond within a reasonable timeframe,
              and no later than required by POPIA.
            </p>
            <p>
              <strong>Complaints:</strong> If you believe your personal information has been
              mishandled, you have the right to lodge a complaint with the{' '}
              <a href="https://inforeg.org.za" className="text-primary hover:underline">
                Information Regulator of South Africa
              </a>
              .
            </p>
          </Section>

          {/* Data Security */}
          <Section title="Data Security">
            <p>
              We take the security of your personal information seriously. Our measures include:
            </p>
            <ul>
              <li>All data transmitted via HTTPS (encrypted in transit)</li>
              <li>Database access restricted via role-based authentication</li>
              <li>
                Admin panel access limited to authorised users with multi-factor authentication
              </li>
              <li>Regular access reviews to ensure only appropriate staff have access</li>
              <li>Encrypted backups of critical data</li>
              <li>Staff awareness of data protection responsibilities</li>
            </ul>
            <p>
              No system is perfectly secure. If you believe there has been a data breach affecting
              your information, please contact us immediately at{' '}
              <a href="mailto:infrastructure@aisafetysa.com" className="text-primary hover:underline">
                infrastructure@aisafetysa.com
              </a>
              .
            </p>
          </Section>

          {/* Data Breaches */}
          <Section title="Data Breaches">
            <p>If a data breach occurs involving personal information, we will:</p>
            <ul>
              <li>
                <strong>Notify the Information Regulator</strong> as soon as reasonably possible
                after becoming aware of the breach
              </li>
              <li>
                <strong>Notify affected individuals</strong> where the breach is likely to result in
                risk to your rights, including a description of what happened, what data was involved,
                and what steps we are taking
              </li>
              <li>
                <strong>Take immediate steps</strong> to contain the breach and prevent further
                unauthorised access
              </li>
            </ul>
          </Section>

          {/* Cookies */}
          <Section title="Cookies and Tracking">
            <p>
              Our website uses cookies and similar technologies. We only use essential cookies for
              the functionality of the site.
            </p>
            <Subsection title="Essential Cookies">
              <p>
                Required for the website to function. These cannot be disabled without breaking core
                functionality:
              </p>
              <ul>
                <li>
                  <strong>Session cookies</strong> — Maintain your login state and preferences
                </li>
                <li>
                  <strong>Security cookies</strong> — Protect against fraud and maintain secure
                  sessions
                </li>
              </ul>
            </Subsection>
          </Section>

          {/* Children's Data */}
          <Section title="Children's Data">
            <p>
              Our programs are intended for adults (18+). We do not knowingly collect data from
              children. If we discover we have collected data from someone under 18, we will delete
              it promptly.
            </p>
          </Section>

          {/* Changes */}
          <Section title="Changes to This Policy">
            <p>
              We may update this policy from time to time. Significant changes will be communicated
              via email to registered participants. The &ldquo;last updated&rdquo; date at the top
              indicates when the current version took effect.
            </p>
          </Section>

          {/* Contact */}
          <Section title="Contact">
            <p>
              For privacy questions, data subject requests, or to exercise any of your rights:
            </p>
            <ul>
              <li>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:infrastructure@aisafetysa.com"
                  className="text-primary hover:underline"
                >
                  infrastructure@aisafetysa.com
                </a>
              </li>
              <li>
                <strong>Information Officer:</strong> Charl Botha —{' '}
                <a
                  href="mailto:infrastructure@aisafetysa.com"
                  className="text-primary hover:underline"
                >
                  infrastructure@aisafetysa.com
                </a>
              </li>
              <li>
                <strong>Information Regulator:</strong>{' '}
                <a href="https://inforeg.org.za" className="text-primary hover:underline">
                  inforeg.org.za
                </a>
              </li>
            </ul>
            <p>You can also contact any AISSA organiser directly.</p>
          </Section>

          <hr className="border-border" />

          <p className="text-xs text-muted-foreground">
            This policy applies to the AISSA Track Record platform and related data systems. For
            questions about AISSA&apos;s general operations, contact the organisation directly.
          </p>
        </div>
      </div>
    </PublicShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight border-b border-border pb-2">{title}</h2>
      <div className="space-y-3 text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-foreground [&_a]:text-primary [&_a:hover]:underline">
        {children}
      </div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      <div className="space-y-2 text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  )
}
