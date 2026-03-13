import type { HotelPageSlug } from "@/lib/hotel-pages";
import type { HotelLocale } from "@/lib/hotel-experience";
import { getHotelUi } from "@/lib/hotel-experience";

type HotelNavItem = {
  slug: HotelPageSlug;
  label: string;
  href: string;
};

type HotelMobileMenuProps = {
  activeSlug: HotelPageSlug;
  bookingCtaLabel: string;
  links?: readonly { label: string; href: string }[];
  locale: HotelLocale;
  onLocaleToggle: () => void;
  pages: readonly HotelNavItem[];
  reservationHref: string;
};

export function HotelMobileMenu({ activeSlug, bookingCtaLabel, links, locale, onLocaleToggle, pages, reservationHref }: HotelMobileMenuProps) {
  const navLinks = links?.length ? links : pages;
  const ui = getHotelUi(locale);

  return (
    <details className="hotel-reference-mobile-menu">
      <summary className="hotel-reference-mobile-toggle" aria-label={ui.header.mobileMenuAria}>
        <span />
        <span />
        <span />
      </summary>

      <div className="hotel-reference-mobile-panel">
        <nav className="hotel-reference-mobile-links" aria-label={ui.header.navAria}>
          {navLinks.map((page) => (
            <a className={"slug" in page && page.slug === activeSlug ? "is-active" : undefined} href={page.href} key={page.href}>
              {page.label}
            </a>
          ))}
        </nav>

        <button className="hotel-reference-mobile-locale" onClick={onLocaleToggle} type="button">
          {ui.header.localeButton}
        </button>

        <a className="hotel-reference-mobile-cta" href={reservationHref}>
          {bookingCtaLabel}
        </a>
      </div>
    </details>
  );
}
