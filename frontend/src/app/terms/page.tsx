import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for using WaterPoint Board Uganda.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-black/50 dark:text-white/50">Last updated: August 2026</p>

      <div className="mt-8 space-y-6 text-black/75 dark:text-white/75">
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">1. Acceptance of terms</h2>
          <p className="mt-2">
            By creating an account or using WaterPoint Board Uganda (&ldquo;the platform&rdquo;), you
            agree to these terms. If you do not agree, please do not use the platform.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">2. What the platform is</h2>
          <p className="mt-2">
            WaterPoint Board Uganda is a community water-point status and maintenance tracking tool.
            It relies on community-reported information and does not independently verify water
            quality, safety, or the accuracy of any report. Reported statuses may be out of date or
            incorrect. Always verify water safety through your local water authority before
            consumption.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">3. Accounts and conduct</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for keeping your password confidential.</li>
            <li>
              Reports must be submitted in good faith. Deliberately false, abusive, or malicious
              reports may result in account suspension.
            </li>
            <li>Automated scraping, rate-limit evasion, or attempts to compromise the platform are prohibited.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">4. Roles and responsibilities</h2>
          <p className="mt-2">
            Caretakers and administrators are granted elevated access solely to perform their
            assigned duties (triaging reports, logging maintenance, managing users). Misuse of
            elevated access is grounds for immediate removal.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">5. Intellectual property</h2>
          <p className="mt-2">
            The platform&rsquo;s design, source code, and branding are owned by Perez Chris and
            protected under copyright. See our{" "}
            <a href="/copyright" className="underline">
              copyright &amp; licensing
            </a>{" "}
            page for details on reuse and adoption by other organisations.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">6. No warranty</h2>
          <p className="mt-2">
            The platform is provided &ldquo;as is&rdquo;, without warranty of any kind. We do not
            guarantee uninterrupted availability, and we are not liable for decisions made based on
            information shown on the platform.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">7. Changes to these terms</h2>
          <p className="mt-2">
            We may update these terms as the platform evolves. Continued use after changes take
            effect constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </main>
  );
}
