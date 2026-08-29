import Link from "next/link";

const WHATSAPP_NUMBER = "256705265713";
const PHONE_NUMBER = "256707265713";
const EMAIL = "kweeziperez712@gmail.com";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38a9.94 9.94 0 0 0 4.79 1.22h.01c5.52 0 10-4.48 10-10s-4.48-9.84-10.01-9.84Zm0 18.13a8.1 8.1 0 0 1-4.14-1.14l-.3-.18-3.12.82.83-3.04-.19-.31a8.13 8.13 0 0 1-1.25-4.34c0-4.5 3.66-8.16 8.17-8.16 4.5 0 8.16 3.65 8.16 8.16 0 4.5-3.66 8.19-8.16 8.19Zm4.48-6.12c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5A2.25 2.25 0 0 1 18.75 19.5H5.25A2.25 2.25 0 0 1 3 17.25V6.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 6 8.03 6.02a.75.75 0 0 0 .94 0L20.5 6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25c0-.83.67-1.5 1.5-1.5h2.03c.7 0 1.3.48 1.46 1.16l.83 3.53a1.5 1.5 0 0 1-.44 1.47L7.5 11.5a12.06 12.06 0 0 0 5 5l1.6-1.63a1.5 1.5 0 0 1 1.47-.4l3.5.84c.68.16 1.16.77 1.16 1.47v2.02c0 .83-.67 1.5-1.5 1.5h-1.5C8.87 20.3 3.7 15.13 3.75 6.75v-1.5Z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="ml-1 inline h-3.5 w-3.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h-4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5v-4.5m-3-6h5.25v5.25m0-5.25-9 9" />
    </svg>
  );
}

const CONTACT_LINKS = [
  {
    label: "WhatsApp",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    icon: WhatsAppIcon,
  },
  {
    label: "Email",
    href: `mailto:${EMAIL}`,
    icon: MailIcon,
  },
  {
    label: "Call",
    href: `tel:+${PHONE_NUMBER}`,
    icon: PhoneIcon,
  },
];

const PRODUCT_LINKS = [
  { label: "Water Points", href: "/water-points" },
  { label: "Map & Insights", href: "/map" },
  { label: "About", href: "/about" },
  { label: "Data Methodology", href: "/data-methodology" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Copyright & Licensing", href: "/copyright" },
];

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[var(--wb-surface-100)] text-sm dark:border-white/10 dark:bg-[var(--wb-surface-800)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2 text-base font-semibold">
            <span aria-hidden>💧</span> WaterPoint Board Uganda
          </p>
          <p className="mt-3 max-w-xs text-black/60 dark:text-white/60">
            Community water-point status and maintenance tracking — built for adoption by local
            communities, NGOs, and government water offices.
          </p>
          <div className="mt-4 flex items-center gap-3">
            {CONTACT_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={label}
                title={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-black/60 transition-colors hover:border-[var(--wb-water-500)] hover:text-[var(--wb-water-500)] dark:border-white/20 dark:text-white/60"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-[var(--foreground)]">Explore</p>
          <ul className="mt-3 space-y-2">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-black/60 hover:text-[var(--wb-water-500)] dark:text-white/60">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-[var(--foreground)]">Legal</p>
          <ul className="mt-3 space-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-black/60 hover:text-[var(--wb-water-500)] dark:text-white/60">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-[var(--foreground)]">Contact</p>
          <ul className="mt-3 space-y-2 text-black/60 dark:text-white/60">
            <li>
              <a href={`mailto:${EMAIL}`} className="hover:text-[var(--wb-water-500)]">
                {EMAIL}
              </a>
            </li>
            <li>
              <a href={`tel:+${PHONE_NUMBER}`} className="hover:text-[var(--wb-water-500)]">
                +{PHONE_NUMBER}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--wb-water-500)]">
                WhatsApp us
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-black/50 sm:flex-row sm:px-6 dark:text-white/50">
          <p>
            &copy; {new Date().getFullYear()} WaterPoint Board Uganda. All rights reserved. Data shown
            is fictional demonstration data — see{" "}
            <Link href="/data-methodology" className="underline">
              data methodology
            </Link>
            .
          </p>
          <p>
            Built by{" "}
            <a
              href="https://perezchris.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--wb-water-500)] hover:underline"
            >
              Perez Chris
              <ExternalIcon />
            </a>{" "}
            under{" "}
            <a
              href="https://kcsaas.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--wb-water-500)] hover:underline"
            >
              kcsaas
              <ExternalIcon />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
