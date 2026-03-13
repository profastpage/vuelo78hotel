import type { HotelPageSlug } from "@/lib/hotel-pages";

type HotelNavItem = {
  slug: HotelPageSlug;
  label: string;
  href: string;
};

type HotelMobileMenuProps = {
  activeSlug: HotelPageSlug;
  bookingCtaLabel: string;
  pages: readonly HotelNavItem[];
  reservationHref: string;
};

export function HotelMobileMenu({ activeSlug, bookingCtaLabel, pages, reservationHref }: HotelMobileMenuProps) {
  return (
    <details className="hotel-reference-mobile-menu">
      <summary className="hotel-reference-mobile-toggle" aria-label="Abrir menu">
        <span />
        <span />
        <span />
      </summary>

      <div className="hotel-reference-mobile-panel">
        <nav className="hotel-reference-mobile-links" aria-label="Menu del hotel">
          {pages.map((page) => (
            <a className={page.slug === activeSlug ? "is-active" : undefined} href={page.href} key={page.slug}>
              {page.label}
            </a>
          ))}
        </nav>

        <a className="hotel-reference-mobile-cta" href={reservationHref}>
          {bookingCtaLabel}
        </a>
      </div>
    </details>
  );
}
