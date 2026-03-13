"use client";

import type { SiteContent } from "@/types/site";
import type { HotelHeroSlide } from "./HotelHeroShowcase";
import { HotelBookingBar } from "./HotelBookingBar";
import { HotelHeroShowcase } from "./HotelHeroShowcase";

type HotelPremiumHeroProps = {
  benefits: Array<{ label: string; value: string }>;
  bookingWidget: NonNullable<SiteContent["bookingWidget"]>;
  brandName: string;
  cityLabel: string;
  contactPhone: string;
  detailsHref: string;
  heroDescription: string;
  heroTag: string;
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
  heroTag,
  reservationHref,
  slides,
}: HotelPremiumHeroProps) {
  return (
    <section className="hotel-deluxe-hero-shell" id="inicio">
      <div className="hotel-deluxe-hero-stage">
        <HotelHeroShowcase slides={slides} />
        <div className="hotel-deluxe-hero-overlay" aria-hidden="true" />

        <div className="hotel-deluxe-hero-content">
          <span className="scene-chip hotel-deluxe-hero-chip">{heroTag}</span>
          <h1 className="hotel-deluxe-hero-title">
            <span>{brandName}</span>
            <strong>Tu refugio en {cityLabel}</strong>
          </h1>
          <p className="hotel-deluxe-hero-description">{heroDescription}</p>

          <div className="hotel-deluxe-hero-actions">
            <a className="primary-button hotel-deluxe-whatsapp-button" href={reservationHref}>
              Reservar por WhatsApp
            </a>
            <a className="secondary-button hotel-deluxe-ghost-button" href={detailsHref}>
              Ver habitaciones
            </a>
          </div>
        </div>
      </div>

      <div className="hotel-deluxe-booking-shell">
        <div className="hotel-deluxe-booking-head">
          <span className="hotel-deluxe-booking-kicker">Reserva directa sin intermediarios</span>
          <p>Confirma fechas, habitacion y tarifa desde la web y termina la conversacion por WhatsApp.</p>
        </div>
        <HotelBookingBar bookingWidget={bookingWidget} brandName={brandName} contactPhone={contactPhone} />
        <div className="hotel-deluxe-benefits" aria-label="Beneficios principales del hotel">
          {benefits.map((benefit) => (
            <article className="hotel-deluxe-benefit-card" key={benefit.label}>
              <span className="hotel-deluxe-benefit-icon" aria-hidden="true">
                {benefit.value}
              </span>
              <strong>{benefit.label}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
