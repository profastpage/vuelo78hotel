"use client";

import { BedDouble, Coffee, MapPinned, Snowflake, Sparkles, Wifi } from "lucide-react";
import type { SiteContent } from "@/types/site";
import type { HotelHeroSlide } from "./HotelHeroShowcase";
import { HotelBookingBar } from "./HotelBookingBar";
import { HotelHeroShowcase } from "./HotelHeroShowcase";

type HeroBenefit = {
  icon: "air" | "breakfast" | "location" | "wifi";
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

        <div className="hotel-deluxe-hero-inner hotel-deluxe-hero-inner-premium">
          <div className="hotel-deluxe-hero-content hotel-deluxe-hero-content-premium">
            <span className="scene-chip hotel-deluxe-hero-chip">{heroTag}</span>
            <span className="hotel-deluxe-hero-kicker">Hotel boutique en Tarapoto</span>

            <div className="hotel-deluxe-hero-copyblock">
              <h1 className="hotel-deluxe-hero-title hotel-deluxe-hero-title-premium">
                <span>{brandName}</span>
                <strong>Descanso elegante en {cityLabel}</strong>
              </h1>
              <p className="hotel-deluxe-hero-description hotel-deluxe-hero-description-premium">{heroDescription}</p>
            </div>

            <div className="hotel-deluxe-hero-actions hotel-deluxe-hero-actions-premium">
              <a className="primary-button hotel-deluxe-whatsapp-button" href={reservationHref}>
                Reservar ahora
              </a>
              <a className="secondary-button hotel-deluxe-ghost-button" href={detailsHref}>
                Ver habitaciones
              </a>
            </div>

            <div className="hotel-deluxe-hero-signals" aria-label="Señales de confianza del hotel">
              <article className="hotel-deluxe-hero-signal">
                <span className="hotel-deluxe-hero-signal-icon" aria-hidden="true">
                  <Sparkles size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>Reserva directa</strong>
                  <span>Confirmacion rapida por WhatsApp</span>
                </div>
              </article>
              <article className="hotel-deluxe-hero-signal">
                <span className="hotel-deluxe-hero-signal-icon" aria-hidden="true">
                  <BedDouble size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>Habitaciones comodas</strong>
                  <span>Descanso claro desde el primer scroll</span>
                </div>
              </article>
              <article className="hotel-deluxe-hero-signal">
                <span className="hotel-deluxe-hero-signal-icon" aria-hidden="true">
                  <MapPinned size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>Ubicacion funcional</strong>
                  <span>Cerca del aeropuerto y puntos clave</span>
                </div>
              </article>
            </div>
          </div>

          <div className="hotel-deluxe-booking-shell hotel-deluxe-booking-shell-premium">
            <div className="hotel-deluxe-booking-head hotel-deluxe-booking-head-premium">
              <span className="hotel-deluxe-booking-kicker">Reserva directa</span>
              <p>Consulta disponibilidad y recibe una respuesta directa del hotel sin pasos innecesarios.</p>
            </div>
            <HotelBookingBar bookingWidget={bookingWidget} brandName={brandName} contactPhone={contactPhone} />
          </div>
        </div>
      </div>

      <div className="hotel-deluxe-benefit-rail" aria-label="Beneficios principales del hotel">
        {benefits.map((benefit) => (
          <article className="hotel-deluxe-benefit-pill" key={benefit.label}>
            <span className="hotel-deluxe-benefit-pill-icon" aria-hidden="true">
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
      return <MapPinned size={16} strokeWidth={1.8} />;
  }
}
