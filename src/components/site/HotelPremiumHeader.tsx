"use client";

import type { HotelPageSlug } from "@/lib/hotel-pages";
import { HotelMobileMenu } from "./HotelMobileMenu";

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
  pages: readonly RouteLink[];
  reservationHref: string;
  sectionLinks: readonly SectionLink[];
};

export function HotelPremiumHeader({
  brandName,
  brandTag,
  bookingCtaLabel,
  pages,
  reservationHref,
  sectionLinks,
}: HotelPremiumHeaderProps) {
  return (
    <header className="hotel-reference-header hotel-deluxe-header">
      <a className="hotel-reference-brand hotel-deluxe-brand" href="/" aria-label={`Ir al inicio de ${brandName}`}>
        <span className="hotel-reference-brand-mark hotel-deluxe-brand-mark" aria-hidden="true">
          V
        </span>
        <span className="hotel-reference-brand-copy hotel-deluxe-brand-copy">
          <strong>{brandName}</strong>
          <small>{brandTag}</small>
        </span>
      </a>

      <nav className="hotel-reference-nav hotel-deluxe-nav" aria-label="Secciones principales">
        {sectionLinks.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="hotel-deluxe-header-actions">
        <a className="hotel-deluxe-mobile-whatsapp" href={reservationHref}>
          WhatsApp
        </a>
        <a className="hotel-reference-header-cta hotel-deluxe-header-cta" href={reservationHref}>
          {bookingCtaLabel} por WhatsApp
        </a>
        <HotelMobileMenu activeSlug="hotel" bookingCtaLabel={`${bookingCtaLabel} por WhatsApp`} pages={pages} reservationHref={reservationHref} />
      </div>
    </header>
  );
}
