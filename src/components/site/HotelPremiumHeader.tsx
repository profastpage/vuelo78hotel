"use client";

import { useEffect, useState } from "react";
import type { HotelPageSlug } from "@/lib/hotel-pages";
import { HotelMobileMenu } from "./HotelMobileMenu";
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
      <a className="hotel-reference-brand hotel-deluxe-brand" href="/" aria-label={t(locale, `Ir al inicio de ${brandName}`, `Go to ${brandName} home`)}>
        <span className="hotel-reference-brand-mark hotel-deluxe-brand-mark" aria-hidden="true">
          V
        </span>
        <span className="hotel-reference-brand-copy hotel-deluxe-brand-copy">
          <strong>{brandName}</strong>
          <small>{brandTag}</small>
        </span>
      </a>

      <nav className="hotel-reference-nav hotel-deluxe-nav" aria-label={ui.header.navAria}>
        {sectionLinks.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="hotel-deluxe-header-actions">
        <a className="hotel-deluxe-mobile-whatsapp" href={reservationHref}>
          {ui.header.mobileWhatsapp}
        </a>
        <button
          aria-label={ui.header.localeAria}
          className="hotel-deluxe-header-locale"
          onClick={onLocaleToggle}
          type="button"
        >
          {ui.header.localeButton}
        </button>
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
