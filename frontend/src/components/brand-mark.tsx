import type { SVGProps } from "react";

// Shared brand mark: a single water droplet, used instead of an emoji glyph
// so the logo renders identically across platforms/fonts.
export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.5c3.6 4.2 7 8.6 7 12.7a7 7 0 1 1-14 0c0-4.1 3.4-8.5 7-12.7Z" />
    </svg>
  );
}
