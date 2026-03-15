"use client";

import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import type { HotelPageSlug } from "@/lib/hotel-pages";
import { HotelMobileMenu } from "./HotelMobileMenu";
import { HotelBrandLogo } from "./HotelBrandLogo";
import type { HotelLocale } from "@/lib/hotel-experience";
import { getHotelUi, t } from "@/lib/hotel-experience";

type SectionLink = {
  label: string;
  href: string;
};

type RouteLink = {
  slug: HotelPageSlug;
  label: string;
  href: string;
};

type HotelPremiumHeaderProps = {
  brandName: string;
  brandTag: string;
  bookingCtaLabel: string;
  locale: HotelLocale;
  onLocaleToggle: () => void;
  pages: readonly RouteLink[];
  reservationHref: string;
  sectionLinks: readonly SectionLink[];
};

export function HotelPremiumHeader({
  brandName,
  brandTag,
  bookingCtaLabel,
  locale,
  onLocaleToggle,
  pages,
  reservationHref,
  sectionLinks,
}: HotelPremiumHeaderProps) {
  void brandTag;
  const [isScrolled, setIsScrolled] = useState(false);
  const ui = getHotelUi(locale);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`hotel-reference-header hotel-deluxe-header${isScrolled ? " is-scrolled" : ""}`}>
      <a className="hotel-reference-brand hotel-deluxe-brand hotel-reference-brand--official" href="/" aria-label={t(locale, `Ir al inicio de ${brandName}`, `Go to ${brandName} home`)}>
        <HotelBrandLogo className="hotel-reference-brand-logo" priority />
      </a>

      <nav className="hotel-reference-nav hotel-deluxe-nav" aria-label={ui.header.navAria}>
        {sectionLinks.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="hotel-deluxe-header-actions">
        <div className="hotel-deluxe-mobile-quick-actions">
          <a
            aria-label={ui.header.mobileWhatsapp}
            className="hotel-deluxe-mobile-whatsapp"
            href={reservationHref}
            title={ui.header.mobileWhatsapp}
          >
            <span className="hotel-deluxe-mobile-whatsapp-icon" aria-hidden="true">
              <WhatsAppGlyph />
            </span>
          </a>
          <button
            aria-label={ui.header.localeAria}
            className="hotel-deluxe-header-locale"
            onClick={onLocaleToggle}
            type="button"
          >
            <Globe aria-hidden="true" size={12} strokeWidth={1.9} />
            <span>{ui.header.localeButton}</span>
          </button>
        </div>
        <a className="hotel-reference-header-cta hotel-deluxe-header-cta" href={reservationHref}>
          {bookingCtaLabel} {ui.header.ctaSuffix}
        </a>
        <HotelMobileMenu
          activeSlug="hotel"
          bookingCtaLabel={`${bookingCtaLabel} ${ui.header.ctaSuffix}`}
          links={sectionLinks}
          locale={locale}
          onLocaleToggle={onLocaleToggle}
          pages={pages}
          reservationHref={reservationHref}
        />
      </div>
    </header>
  );
}

function WhatsAppGlyph() {
  return (
    <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.52 3.48A11 11 0 0 0 3.87 17.06L2.5 21.5l4.56-1.31A11 11 0 1 0 20.52 3.48Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M12 4.25A7.75 7.75 0 0 0 5.35 15.94l.19.31-.8 2.58 2.64-.76.3.18A7.75 7.75 0 1 0 12 4.25Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.55"
      />
      <path
        d="M9.2 8.95c-.2-.45-.4-.46-.58-.47h-.5c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.73 4.19 3.72 2.07.82 2.49.66 2.94.62.45-.04 1.46-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.06-.1-.24-.16-.5-.3-.26-.14-1.53-.76-1.77-.84-.24-.08-.42-.12-.6.12-.18.24-.68.84-.84 1.02-.16.18-.32.2-.58.06-.26-.14-1.1-.4-2.1-1.3-.77-.68-1.3-1.52-1.46-1.78-.16-.26-.02-.4.12-.54.12-.12.26-.32.4-.48.14-.16.18-.28.28-.46.1-.18.04-.34-.02-.48-.06-.14-.58-1.4-.8-1.92Z"
        fill="currentColor"
      />
    </svg>
  );
}
