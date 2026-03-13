"use client";

import { Clock3, Coffee, Snowflake, Wifi } from "lucide-react";
import type { SiteContent } from "@/types/site";
import type { HotelHeroSlide } from "./HotelHeroShowcase";
import { HotelBookingBar } from "./HotelBookingBar";
import { HotelHeroShowcase } from "./HotelHeroShowcase";
import type { HotelLocale } from "@/lib/hotel-experience";
import { getHotelUi } from "@/lib/hotel-experience";

type HeroBenefit = {
  icon: "air" | "breakfast" | "reception" | "wifi";
  label: string;
};

type HotelPremiumHeroProps = {
  benefits: HeroBenefit[];
  bookingWidget: NonNullable<SiteContent["bookingWidget"]>;
  brandName: string;
  cityLabel: string;
  contactPhone: string;
  detailsHref: string;
  heroDescription: string;
  heroHeadline: string;
  heroTag: string;
  locale: HotelLocale;
  reservationHref: string;
  slides: HotelHeroSlide[];
};

export function HotelPremiumHero({
  benefits,
  bookingWidget,
  brandName,
  cityLabel,
  contactPhone,
  detailsHref,
  heroDescription,
  heroHeadline,
  heroTag,
  locale,
  reservationHref,
  slides,
}: HotelPremiumHeroProps) {
  const ui = getHotelUi(locale);

  return (
    <section className="hotel-deluxe-hero-shell hotel-home-hero" id="inicio">
      <div className="hotel-deluxe-hero-stage hotel-home-hero-stage">
        <HotelHeroShowcase slides={slides} />
        <div className="hotel-deluxe-hero-overlay hotel-home-hero-overlay" aria-hidden="true" />
        <div className="hotel-deluxe-hero-atmo hotel-home-hero-atmo" aria-hidden="true" />

        <div className="hotel-deluxe-hero-inner hotel-home-hero-layout hotel-home-hero-layout-centered">
          <div className="hotel-deluxe-hero-content hotel-home-hero-copy hotel-home-hero-copy-centered">
            <span className="scene-chip hotel-deluxe-hero-chip">{heroTag}</span>
            <span className="hotel-deluxe-hero-kicker">{ui.hero.directKicker}</span>

            <div className="hotel-home-hero-copyblock">
              <p className="hotel-home-hero-brand">{brandName}</p>
              <h1 className="hotel-deluxe-hero-title hotel-home-hero-title">
                <strong>{heroHeadline}</strong>
              </h1>
              <p className="hotel-home-hero-subtitle">
                {ui.hero.subtitlePrefix} {cityLabel}
              </p>
              <p className="hotel-deluxe-hero-description hotel-home-hero-description">{heroDescription}</p>
            </div>

            <div className="hotel-deluxe-hero-actions hotel-home-hero-actions">
              <a className="primary-button hotel-deluxe-whatsapp-button hotel-home-hero-primary" href={reservationHref}>
                {ui.hero.primaryCta}
              </a>
              <a className="secondary-button hotel-deluxe-ghost-button" href={detailsHref}>
                {ui.hero.secondaryCta}
              </a>
            </div>

            <div className="hotel-deluxe-booking-shell hotel-home-reservation-card hotel-home-reservation-card-inline">
              <div className="hotel-deluxe-booking-head hotel-home-reservation-head">
                <span className="hotel-deluxe-booking-kicker">{ui.hero.bookingKicker}</span>
                <p>{ui.hero.bookingDescription}</p>
              </div>
              <HotelBookingBar bookingWidget={bookingWidget} brandName={brandName} contactPhone={contactPhone} locale={locale} />
            </div>
          </div>
        </div>
      </div>

      <div className="hotel-home-benefits-strip" aria-label={locale === "en" ? "Main hotel benefits" : "Beneficios principales del hotel"}>
        {benefits.map((benefit) => (
          <article className="hotel-home-benefit-item" key={benefit.label}>
            <span className="hotel-home-benefit-icon" aria-hidden="true">
              <HeroBenefitIcon kind={benefit.icon} />
            </span>
            <strong>{benefit.label}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function HeroBenefitIcon({ kind }: { kind: HeroBenefit["icon"] }) {
  switch (kind) {
    case "breakfast":
      return <Coffee size={16} strokeWidth={1.8} />;
    case "wifi":
      return <Wifi size={16} strokeWidth={1.8} />;
    case "air":
      return <Snowflake size={16} strokeWidth={1.8} />;
    default:
      return <Clock3 size={16} strokeWidth={1.8} />;
  }
}
