"use client";

import { BedDouble, Clock3, Coffee, MapPinned, Snowflake, Wifi } from "lucide-react";
import type { SiteContent } from "@/types/site";
import type { HotelHeroSlide } from "./HotelHeroShowcase";
import { HotelBookingBar } from "./HotelBookingBar";
import { HotelHeroShowcase } from "./HotelHeroShowcase";

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
  reservationHref,
  slides,
}: HotelPremiumHeroProps) {
  return (
    <section className="hotel-deluxe-hero-shell hotel-home-hero" id="inicio">
      <div className="hotel-deluxe-hero-stage hotel-home-hero-stage">
        <HotelHeroShowcase slides={slides} />
        <div className="hotel-deluxe-hero-overlay hotel-home-hero-overlay" aria-hidden="true" />
        <div className="hotel-deluxe-hero-atmo hotel-home-hero-atmo" aria-hidden="true" />

        <div className="hotel-deluxe-hero-inner hotel-home-hero-layout">
          <div className="hotel-deluxe-hero-content hotel-home-hero-copy">
            <span className="scene-chip hotel-deluxe-hero-chip">{heroTag}</span>
            <span className="hotel-deluxe-hero-kicker">Reserva directa cerca del aeropuerto</span>

            <div className="hotel-home-hero-copyblock">
              <p className="hotel-home-hero-brand">{brandName}</p>
              <h1 className="hotel-deluxe-hero-title hotel-home-hero-title">
                <strong>{heroHeadline}</strong>
              </h1>
              <p className="hotel-deluxe-hero-description hotel-home-hero-description">{heroDescription}</p>
            </div>

            <div className="hotel-home-hero-meta" aria-label="Datos clave del hotel">
              <span>
                <BedDouble size={16} strokeWidth={1.8} />
                Habitaciones comodas
              </span>
              <span>
                <Clock3 size={16} strokeWidth={1.8} />
                Recepcion 24h
              </span>
              <span>
                <MapPinned size={16} strokeWidth={1.8} />
                {cityLabel}
              </span>
            </div>

            <div className="hotel-deluxe-hero-actions hotel-home-hero-actions">
              <a className="primary-button hotel-deluxe-whatsapp-button" href={reservationHref}>
                Reservar ahora
              </a>
              <a className="secondary-button hotel-deluxe-ghost-button" href={detailsHref}>
                Ver habitaciones
              </a>
            </div>
          </div>

          <div className="hotel-deluxe-booking-shell hotel-home-reservation-card">
            <div className="hotel-deluxe-booking-head hotel-home-reservation-head">
              <span className="hotel-deluxe-booking-kicker">Reserva directa</span>
              <h2>Consulta fechas y habitacion</h2>
              <p>Elige tu tipo de habitacion, entrada, salida y huespedes. El hotel responde directo por WhatsApp.</p>
            </div>
            <HotelBookingBar bookingWidget={bookingWidget} brandName={brandName} contactPhone={contactPhone} />
          </div>
        </div>
      </div>

      <div className="hotel-home-benefits-strip" aria-label="Beneficios principales del hotel">
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
