import PageHero from '@/components/PageHero';

const LAST_UPDATED = 'September 18, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#1e3a8a] mb-3">{title}</h2>
      <div className="text-[#374151] text-[15px] leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        hindiTitle="गोपनीयता नीति"
        title="Privacy Policy"
        subtitle="Mero Yuva Website & Mobile App · Department of Youth Welfare & PRD, Government of Uttarakhand"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]}
      />

      <section className="py-10 sm:py-16 px-4 sm:px-5">
        <div className="max-w-[900px] mx-auto bg-white rounded-2xl p-6 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#e2e8f0]">
          <p className="text-sm text-[#9ca3af] mb-8">Last updated: {LAST_UPDATED}</p>

          <Section title="1. Overview">
            <p>
              This Privacy Policy applies to the Mero Yuva website (meroyuva.in) and the Mero Yuva mobile
              application (together, the &quot;Platform&quot;), operated by the Department of Youth Welfare and
              Panchayati Raj Department (PRD), Government of Uttarakhand. It explains what information we collect
              from citizens, officers and administrators who use the Platform, why we collect it, how it is stored
              and protected, and the choices available to you.
            </p>
            <p>
              By using the Platform — including registering for a scheme or event such as the CM Championship
              Trophy, submitting a grievance, or logging in as a Youth Welfare/PRD officer — you agree to the
              collection and use of information as described in this policy.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong>a) Identity and contact details</strong> you provide when registering: full name, father&apos;s and mother&apos;s name, date of birth, gender, address, mobile number, and email address.</p>
            <p><strong>b) Government identity documents</strong>: Aadhaar number, and uploaded copies of birth/education certificates, residence proof, and disability certificates (where applicable).</p>
            <p><strong>c) Bank details</strong>, only where required for a scheme that disburses funds at the state level: bank name, account holder name, account number, IFSC code, and a photo of the passbook or a cancelled cheque.</p>
            <p><strong>d) Photographs and uploaded files</strong> you submit as part of an application, stored securely via our cloud storage provider (Microsoft Azure, India region).</p>
            <p><strong>e) Geographic and eligibility information</strong>: district, block, Sansad, Vidhan Sabha and Nyay Panchayat, sport/event selections, and age-category, used to place your application in the correct administrative jurisdiction and eligibility bracket.</p>
            <p><strong>f) Account credentials</strong> for officers and administrators (username, hashed password) who log in to review and process applications on behalf of the Department.</p>
            <p><strong>g) Technical information</strong>: basic device and usage information (such as IP address and app version) collected automatically to keep the Platform secure and functioning correctly.</p>
          </Section>

          <Section title="3. Registrations Involving Minors">
            <p>
              Several schemes (for example, CM Trophy&apos;s Under-14 and Under-19 age categories) are open to
              minors. Where an applicant is a minor, the registration is expected to be completed by, or with the
              involvement of, a parent or guardian, who is responsible for the accuracy of the information
              submitted and for consenting to its collection on the minor&apos;s behalf.
            </p>
          </Section>

          <Section title="4. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-2">
              <li>To process and verify applications for schemes, events and programmes run by the Department.</li>
              <li>To assign applications to the correct district/block/Nyay Panchayat officer for review and approval.</li>
              <li>To communicate with you about the status of your application, event schedules, or grievances.</li>
              <li>To disburse benefits or prizes where a scheme requires bank details.</li>
              <li>To generate anonymised or aggregated statistics (e.g. registration counts by district) for programme planning and public reporting.</li>
              <li>To maintain the security, integrity and proper functioning of the Platform, and to prevent fraud or duplicate/test submissions.</li>
            </ul>
          </Section>

          <Section title="5. Who Can Access Your Information">
            <p>
              Access is restricted on a need-to-know basis and enforced in the Platform&apos;s software, not just
              by policy:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Block Officers (BO)</strong> can only view and act on registrations belonging to their own assigned block.</li>
              <li><strong>District and state-level administrators</strong> can view registrations relevant to their jurisdiction or, for designated system administrators, statewide.</li>
              <li>We do not sell, rent, or share your personal information with any private third party for marketing purposes.</li>
              <li>Information may be disclosed where required by law, a court order, or a lawful directive from a competent government authority.</li>
            </ul>
          </Section>

          <Section title="6. Data Storage and Security">
            <p>
              Application data is stored in a secured database, and uploaded files (photographs, certificates,
              proofs) are stored in Microsoft Azure Blob Storage within an India-based data region. Access to
              administrative systems requires authenticated login, and file uploads use time-limited, single-use
              links (SAS tokens) rather than public access. We take reasonable technical and organisational
              measures to protect your information against unauthorised access, alteration, or loss, but no method
              of electronic storage or transmission is 100% secure.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain application records for as long as necessary to administer the relevant scheme, comply
              with government record-keeping requirements, and resolve any disputes or grievances. Records may be
              retained for historical and statistical reference by the Department beyond the completion of an
              individual event or scheme cycle.
            </p>
          </Section>

          <Section title="8. Your Rights and Grievances">
            <p>
              You may contact us to ask what information we hold about you, to request a correction of inaccurate
              details, or to raise a concern about how your information has been handled. Corrections to a
              submitted application should be routed through the relevant Block/District officer or the
              Department&apos;s contact channels below.
            </p>
          </Section>

          <Section title="9. Cookies and Similar Technologies">
            <p>
              The website uses minimal cookies/local storage strictly necessary to keep you signed in and to
              remember your language preference. We do not use third-party advertising or tracking cookies.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for
              legal or operational reasons. The &quot;Last updated&quot; date at the top of this page indicates
              when it was last revised. Continued use of the Platform after changes take effect constitutes
              acceptance of the revised policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              For questions about this Privacy Policy or your personal information, please contact:
            </p>
            <p>
              Department of Youth Welfare and PRD, Government of Uttarakhand<br />
              Uttarakhand Secretariat, Subhash Road, Dehradun – 248001<br />
              Email: ykprd.uk@gmail.com
            </p>
          </Section>
        </div>
      </section>
    </>
  );
}
