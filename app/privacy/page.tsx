import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-800">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="font-bold text-xl tracking-tight text-slate-900">
            Realocate<span className="text-emerald-500">.ai</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-6 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: 19 February 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">1. Who we are</h2>
            <p>
              Realocate.ai is a personal project operated by Omer Alphandar (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
              We provide an AI-powered relocation guidance platform accessible at realocate.ai.
              For privacy enquiries contact us at:{" "}
              <a href="mailto:alphandaryomer@gmail.com" className="text-emerald-600 underline">
                alphandaryomer@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">2. What data we collect</h2>
            <p>We collect the following personal data when you create an account and use the service:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-slate-600">
              <li><strong>Account data:</strong> name, email address, and (if signing in with Google) your Google profile picture.</li>
              <li><strong>Profile data:</strong> nationality, country of origin, destination country, employment status, family status, and estimated moving date.</li>
              <li><strong>Usage data:</strong> task completion status, custom tasks you create, and AI enrichment requests.</li>
              <li><strong>Technical data:</strong> IP address, browser type, and session cookies (used solely to keep you logged in).</li>
            </ul>
            <p className="mt-3">We do not collect payment card details directly — payments are handled by a third-party processor (see section 5).</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">3. Why we collect it and our legal basis (GDPR)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse mt-2">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left p-2 border border-slate-200 font-semibold">Purpose</th>
                    <th className="text-left p-2 border border-slate-200 font-semibold">Legal basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-200">Providing the relocation journey and task list</td>
                    <td className="p-2 border border-slate-200">Performance of a contract (Art. 6(1)(b) GDPR)</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2 border border-slate-200">Personalising tasks with AI (sending your profile to Anthropic)</td>
                    <td className="p-2 border border-slate-200">Performance of a contract (Art. 6(1)(b) GDPR)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200">Authentication and session management</td>
                    <td className="p-2 border border-slate-200">Legitimate interests (Art. 6(1)(f) GDPR)</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2 border border-slate-200">Improving the service and fixing bugs</td>
                    <td className="p-2 border border-slate-200">Legitimate interests (Art. 6(1)(f) GDPR)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200">Sending transactional emails (progress updates, welcome)</td>
                    <td className="p-2 border border-slate-200">Legitimate interests (Art. 6(1)(f) GDPR)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">4. AI processing</h2>
            <p>
              To generate and personalise your relocation tasks, we send a subset of your profile data
              (nationality, origin country, destination country, employment status, and family status)
              to the Anthropic API. This data is used only to generate your task content and is not
              used by Anthropic to train their models under our API agreement. We have signed
              Anthropic&apos;s Data Processing Addendum.
            </p>
            <p className="mt-2">
              No sensitive personal data (passwords, payment details) is ever sent to any AI model.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">5. Third parties we share data with</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong>Anthropic, Inc.</strong> — AI task generation. Profile data only. DPA signed.
                See <a href="https://www.anthropic.com/privacy" className="text-emerald-600 underline" target="_blank" rel="noopener noreferrer">Anthropic Privacy Policy</a>.
              </li>
              <li>
                <strong>Google LLC</strong> — OAuth sign-in. We receive your name and email from Google if you choose to sign in with Google.
                See <a href="https://policies.google.com/privacy" className="text-emerald-600 underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
              </li>
              <li>
                <strong>Supabase / hosting provider</strong> — Your data is stored in a PostgreSQL database hosted on Supabase (EU region). Supabase is GDPR-compliant.
              </li>
              <li>
                <strong>Payment processor (Paddle)</strong> — If you purchase a paid plan, payment is handled by Paddle.com Market Ltd, which acts as Merchant of Record. We do not receive or store your card details.
              </li>
              <li>
                <strong>Analytics</strong> — We may use privacy-friendly, cookieless analytics (Plausible Analytics). No personal data is shared.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">6. Cookies</h2>
            <p>
              We use strictly necessary session cookies to keep you logged in. These cookies do not track you
              across other websites and do not require your consent under ePrivacy rules. We do not use
              advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">7. Data retention</h2>
            <p>
              We retain your account and profile data for as long as your account is active. If you delete
              your account, all personal data is permanently deleted within 30 days. Journey data (task
              completion history) is deleted along with your account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">8. Your rights under GDPR</h2>
            <p>If you are located in the EU/EEA or UK, you have the following rights:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-slate-600">
              <li><strong>Access:</strong> request a copy of the data we hold about you.</li>
              <li><strong>Rectification:</strong> correct inaccurate data.</li>
              <li><strong>Erasure:</strong> request deletion of your data (&quot;right to be forgotten&quot;).</li>
              <li><strong>Portability:</strong> receive your data in a machine-readable format.</li>
              <li><strong>Objection:</strong> object to processing based on legitimate interests.</li>
              <li><strong>Restriction:</strong> request that we limit processing in certain circumstances.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a href="mailto:alphandaryomer@gmail.com" className="text-emerald-600 underline">
                alphandaryomer@gmail.com
              </a>{" "}
              with the subject line &quot;GDPR Request&quot;. We will respond within 30 days.
            </p>
            <p className="mt-2">
              You also have the right to lodge a complaint with your local data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">9. International transfers</h2>
            <p>
              Anthropic is a US-based company. When we send data to the Anthropic API, it is transferred
              to the United States. This transfer is covered by Anthropic&apos;s Standard Contractual Clauses (SCCs)
              as part of our Data Processing Addendum.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">10. Children</h2>
            <p>
              Realocate.ai is not directed at children under the age of 16. We do not knowingly collect
              personal data from anyone under 16. If you believe a child has provided us with personal
              data, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">11. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by email or via a notice on the platform. The &quot;last updated&quot; date at the top of
              this page will always reflect the most recent version.
            </p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex gap-6 text-xs text-slate-400">
          <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-slate-600 transition-colors">Back to Realocate.ai</Link>
        </div>

      </div>
    </div>
  );
}
