import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: true, follow: true },
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-800">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="font-bold text-xl tracking-tight text-slate-900">
            Realocate<span className="text-emerald-500">.ai</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-6 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-500">Last updated: 19 February 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">1. Who we are and acceptance</h2>
            <p>
              Realocate.ai is operated by Omer Alphandar (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
              By creating an account or using the platform, you agree to these Terms of Service.
              If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">2. What Realocate.ai is — and is not</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
              <p className="font-semibold text-amber-800 mb-1">Important disclaimer</p>
              <p className="text-amber-700">
                Realocate.ai provides general information and AI-generated guidance to help you organise
                your relocation. It does <strong>not</strong> constitute legal advice, immigration advice,
                tax advice, financial advice, or any other form of professional advice.
              </p>
              <p className="text-amber-700 mt-2">
                Relocation requirements, visa rules, and bureaucratic procedures change frequently and
                vary by individual circumstances. Always verify all information with the relevant official
                authorities or a qualified professional before acting on it.
              </p>
            </div>
            <p className="mt-3 text-slate-600">
              We are a tool to help you stay organised — not a substitute for a lawyer, immigration consultant,
              or relocation agency. Any decisions you make based on content provided by Realocate.ai are
              entirely your own responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">3. Beta service</h2>
            <p>
              Realocate.ai is currently in beta. The service is provided &quot;as is&quot; and may contain bugs,
              incomplete features, or inaccuracies. We reserve the right to change, suspend, or discontinue
              any part of the service at any time without notice during the beta period.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">4. Accounts</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>You must be at least 18 years old to create an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must provide accurate information during registration. Do not create accounts using someone else&apos;s identity.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">5. Paid plans</h2>
            <p>
              Certain features require a paid plan. Prices are displayed at the point of purchase.
              Payments are processed by Paddle.com Market Ltd, our Merchant of Record, which means
              Paddle is the seller of record for all transactions and handles applicable taxes including VAT.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-slate-600">
              <li><strong>One-time purchases</strong> (Solo plan) are non-refundable once AI enrichment has been generated for your journey.</li>
              <li><strong>Annual subscriptions</strong> (Nomad Pass) may be cancelled at any time; access continues until the end of the billing period.</li>
              <li>All prices are in USD unless otherwise stated.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">6. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-slate-600">
              <li>Use the service for any unlawful purpose or in violation of any regulations.</li>
              <li>Attempt to reverse-engineer, scrape, or extract data from the platform at scale.</li>
              <li>Share your account credentials with others or use the service on behalf of someone else without their consent.</li>
              <li>Submit false or misleading information that could affect task generation for other users.</li>
              <li>Use automated tools to abuse the AI enrichment feature or generate excessive API calls.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">7. AI-generated content</h2>
            <p>
              Task descriptions, instructions, and guidance are generated or enriched by an AI model
              (Anthropic Claude). AI-generated content may be incomplete, outdated, or incorrect.
              We do not guarantee the accuracy of any AI-generated content and accept no liability
              for actions taken based on it.
            </p>
            <p className="mt-2">
              You retain ownership of any custom tasks or content you create on the platform.
              You grant us a limited licence to store and display that content as part of the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">8. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Realocate.ai and its operators shall
              not be liable for any indirect, incidental, special, consequential, or punitive damages,
              including but not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2 text-slate-600">
              <li>Missed visa or permit deadlines</li>
              <li>Incorrect or incomplete relocation guidance</li>
              <li>Loss of data due to service interruptions</li>
              <li>Any decisions made based on AI-generated content</li>
            </ul>
            <p className="mt-3">
              Our total liability to you for any claim arising from use of the service shall not
              exceed the amount you paid us in the 12 months prior to the claim, or €50, whichever
              is greater.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">9. Intellectual property</h2>
            <p>
              All content, design, and code of Realocate.ai is owned by or licensed to us.
              You may not copy, reproduce, or redistribute any part of the platform without our
              prior written consent. The &quot;Realocate.ai&quot; name and branding are our exclusive property.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">10. Termination</h2>
            <p>
              You may delete your account at any time by contacting us at{" "}
              <a href="mailto:alphandaryomer@gmail.com" className="text-emerald-600 underline">
                alphandaryomer@gmail.com
              </a>
              . We will permanently delete your data within 30 days of your request.
            </p>
            <p className="mt-2">
              We may terminate or suspend your account immediately if you breach these terms,
              without prior notice or liability.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">11. Governing law</h2>
            <p>
              These Terms are governed by the laws of the Czech Republic. Any disputes arising from
              these Terms or your use of the service shall be subject to the exclusive jurisdiction
              of the courts of the Czech Republic, unless mandatory consumer protection laws in your
              country provide otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">12. Changes to these terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes
              by email or via a notice on the platform at least 14 days before they take effect.
              Continued use of the service after the effective date constitutes acceptance of the
              updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">13. Contact</h2>
            <p>
              For any questions about these Terms, contact us at:{" "}
              <a href="mailto:alphandaryomer@gmail.com" className="text-emerald-600 underline">
                alphandaryomer@gmail.com
              </a>
            </p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex gap-6 text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-slate-600 transition-colors">Back to Realocate.ai</Link>
        </div>

      </div>
    </div>
  );
}
