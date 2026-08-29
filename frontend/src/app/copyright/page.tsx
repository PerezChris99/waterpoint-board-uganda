import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copyright & Licensing",
  description: "Copyright ownership and licensing terms for WaterPoint Board Uganda.",
};

export default function CopyrightPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">Copyright &amp; Licensing</h1>
      <p className="mt-2 text-sm text-black/50 dark:text-white/50">Last updated: August 2026</p>

      <div className="mt-8 space-y-6 text-black/75 dark:text-white/75">
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Ownership</h2>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} Perez Chris. All rights reserved. WaterPoint Board
            Uganda — including its design, source code, database schema, and branding — is the
            original work of Perez Chris, built under{" "}
            <a href="https://kcsaas.vercel.app" target="_blank" rel="noopener noreferrer" className="underline">
              kcsaas
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Adoption by governments and NGOs</h2>
          <p className="mt-2">
            This platform was built with public-sector and NGO adoption in mind. District water
            offices, national water ministries, and NGOs running WASH programmes are welcome to
            enquire about a licensed deployment for their own communities — with their own real data,
            branding, and infrastructure. Contact us using the details in the footer to discuss
            adoption, customization, or a managed deployment.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">What is not permitted</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Copying, redistributing, or reselling the platform&rsquo;s source code without permission.</li>
            <li>Removing or altering copyright and attribution notices.</li>
            <li>Presenting a derivative of this platform as your own original work.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Demo data disclaimer</h2>
          <p className="mt-2">
            All water point, report, and user data visible on the public demo instance is fictional
            and generated for demonstration purposes only. See our{" "}
            <a href="/data-methodology" className="underline">
              data methodology
            </a>{" "}
            page for details.
          </p>
        </section>
      </div>
    </main>
  );
}
