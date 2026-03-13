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
        <div className="hotel-deluxe-hero-atmo" aria-hidden="true" />

        <div className="hotel-deluxe-hero-inner">
          <div className="hotel-deluxe-hero-content">
            <span className="scene-chip hotel-deluxe-hero-chip">{heroTag}</span>
            <span className="hotel-deluxe-hero-kicker">Reserva directa y descanso cerca del aeropuerto</span>
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

            <div className="hotel-deluxe-hero-note">
              <span className="hotel-deluxe-hero-note-dot" aria-hidden="true" />
              <p>Atencion 24 horas, desayuno incluido y confirmacion rapida por WhatsApp.</p>
            </div>
          </div>

          <div className="hotel-deluxe-booking-shell">
            <div className="hotel-deluxe-booking-head">
              <span className="hotel-deluxe-booking-kicker">Reserva directa</span>
              <p>Elige tus fechas y consulta disponibilidad por WhatsApp en pocos pasos.</p>
            </div>
            <HotelBookingBar bookingWidget={bookingWidget} brandName={brandName} contactPhone={contactPhone} />
            <div className="hotel-deluxe-benefits" aria-label="Beneficios principales del hotel">
              {benefits.map((benefit, index) => (
                <article className="hotel-deluxe-benefit-card" key={benefit.label}>
                  <span className="hotel-deluxe-benefit-icon" aria-hidden="true">
                    {renderBenefitIcon(index)}
                  </span>
                  <strong>{benefit.label}</strong>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderBenefitIcon(index: number) {
  const commonProps = {
    fill: "none",
    height: 18,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    width: 18,
  };

  switch (index) {
    case 0:
      return (
        <svg {...commonProps}>
          <path d="M3 7.5h18" />
          <path d="M5 7.5V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1.5" />
          <path d="M5 18v-7.5" />
          <path d="M19 18v-7.5" />
          <path d="M3 18h18" />
          <path d="M7 18v2" />
          <path d="M17 18v2" />
        </svg>
      );
    case 1:
      return (
        <svg {...commonProps}>
          <path d="M4 9c2.4 0 2.4 3 4.8 3 2.4 0 2.4-3 4.8-3s2.4 3 4.8 3 2.4-3 4.8-3" />
          <path d="M4 14c2.4 0 2.4 3 4.8 3 2.4 0 2.4-3 4.8-3s2.4 3 4.8 3 2.4-3 4.8-3" />
        </svg>
      );
    case 2:
      return (
        <svg {...commonProps}>
          <path d="M8 4v4" />
          <path d="M16 4v4" />
          <path d="M6 10a6 6 0 1 0 12 0" />
          <path d="M12 10v5" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M12 3v3" />
          <path d="M6.5 5.5 8.6 7.6" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <path d="m15.4 7.6 2.1-2.1" />
          <path d="M8 21h8" />
          <path d="M9 18h6" />
          <path d="M8.6 16.4A5.5 5.5 0 1 1 17.5 12c0 1.8-.8 3.1-2.2 4.4-.6.6-.8.9-.8 1.6h-5c0-.7-.2-1-.9-1.6Z" />
        </svg>
      );
  }
}
