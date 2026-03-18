"use client";

import { Clock3, Coffee, GlassWater, Monitor, Snowflake, SquareParking, UtensilsCrossed, Waves, Wifi } from "lucide-react";
import type { SiteContent } from "@/types/site";
import type { HotelHeroSlide } from "./HotelHeroShowcase";
import { HotelBookingBar } from "./HotelBookingBar";
import { HotelHeroShowcase } from "./HotelHeroShowcase";
import type { HotelLocale } from "@/lib/hotel-experience";
import { getHotelUi } from "@/lib/hotel-experience";

type HeroBenefit = {
  icon: "air" | "breakfast" | "dining" | "parking" | "pool" | "reception" | "restobar" | "wifi" | "workspace";
  label: string;
};

type HotelPremiumHeroProps = {
  benefits: HeroBenefit[];
  bookingWidget: NonNullable<SiteContent["bookingWidget"]>;
  brandName: string;
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
              <HotelBookingBar
                bookingWidget={bookingWidget}
                brandName={brandName}
                contactPhone={contactPhone}
                locale={locale}
                whatsappIntent="hero"
              />
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

      <style jsx global>{`
        .page-shell.mode-reference-clone-hotel .hotel-deluxe-hero-stage .hotel-reference-hero-slide {
          transform: scale(1.018);
          transition:
            opacity 1200ms ease,
            transform 6200ms ease;
        }

        .page-shell.mode-reference-clone-hotel .hotel-deluxe-hero-stage .hotel-reference-hero-slide.is-active {
          transform: scale(1);
        }

        .page-shell.mode-reference-clone-hotel .hotel-reference-hero-slide-media {
          filter: saturate(1.03) contrast(1.03) brightness(1.01);
        }

        .page-shell.mode-reference-clone-hotel .hotel-home-hero-overlay {
          background:
            linear-gradient(180deg, rgba(7, 10, 12, 0.28) 0%, rgba(7, 10, 12, 0.04) 24%, rgba(9, 12, 14, 0.1) 58%, rgba(7, 10, 12, 0.34) 100%),
            radial-gradient(circle at 16% 18%, rgba(16, 77, 96, 0.05), transparent 30%),
            radial-gradient(circle at 78% 18%, rgba(203, 161, 91, 0.05), transparent 28%),
            linear-gradient(90deg, rgba(8, 10, 12, 0.08), rgba(8, 10, 12, 0.01) 34%, rgba(8, 10, 12, 0.06));
        }

        .page-shell.mode-reference-clone-hotel .hotel-home-hero-atmo {
          filter: blur(8px);
          opacity: 0.22;
        }

        .page-shell.mode-reference-clone-hotel .hotel-home-hero-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 248px));
          justify-content: center;
          gap: 12px;
          width: 100%;
          margin-top: 10px;
        }

        .page-shell.mode-reference-clone-hotel .hotel-home-hero-primary,
        .page-shell.mode-reference-clone-hotel .hotel-home-hero-actions .secondary-button {
          width: 100%;
          min-width: 0;
          min-height: 56px;
          padding-inline: 22px;
          justify-content: center;
        }

        .page-shell.mode-reference-clone-hotel .hotel-home-hero-primary {
          box-shadow:
            0 18px 32px rgba(31, 74, 48, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .page-shell.mode-reference-clone-hotel .hotel-deluxe-ghost-button {
          background: rgba(244, 233, 214, 0.04);
          border-color: rgba(244, 231, 208, 0.38);
          color: #fff8ee;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 12px 22px rgba(7, 10, 12, 0.08);
          backdrop-filter: blur(10px);
        }

        .page-shell.mode-reference-clone-hotel .hotel-home-reservation-card-inline {
          margin-top: 42px;
        }

        @media (max-width: 860px) {
          .page-shell.mode-reference-clone-hotel .hotel-reference-hero-slide-media {
            filter: saturate(1.04) contrast(1.04) brightness(1.01);
          }

          .page-shell.mode-reference-clone-hotel .hotel-home-hero-stage {
            min-height: clamp(940px, 108svh, 1100px);
          }

          .page-shell.mode-reference-clone-hotel .hotel-home-hero-overlay {
            background:
              linear-gradient(180deg, rgba(7, 10, 12, 0.24) 0%, rgba(7, 10, 12, 0.04) 22%, rgba(9, 12, 14, 0.1) 58%, rgba(7, 10, 12, 0.3) 100%),
              linear-gradient(90deg, rgba(8, 10, 12, 0.06), rgba(8, 10, 12, 0.01) 50%, rgba(8, 10, 12, 0.06));
          }

          .page-shell.mode-reference-clone-hotel .hotel-home-hero-atmo {
            filter: blur(7px);
            opacity: 0.16;
          }

          .page-shell.mode-reference-clone-hotel .hotel-home-hero-layout-centered {
            padding-top: clamp(144px, 17svh, 170px);
            padding-bottom: clamp(138px, 15svh, 168px);
          }

          .page-shell.mode-reference-clone-hotel .hotel-home-hero-copy-centered {
            gap: 20px;
          }

          .page-shell.mode-reference-clone-hotel .hotel-home-hero-copyblock {
            gap: 14px;
          }

          .page-shell.mode-reference-clone-hotel .hotel-home-hero-actions {
            grid-template-columns: 1fr;
            justify-items: center;
            gap: 10px;
            margin-top: 8px;
          }

          .page-shell.mode-reference-clone-hotel .hotel-home-hero-primary,
          .page-shell.mode-reference-clone-hotel .hotel-home-hero-actions .secondary-button {
            width: min(85%, 320px);
            min-height: 54px;
            padding-inline: 20px;
          }

          .page-shell.mode-reference-clone-hotel .hotel-home-reservation-card-inline {
            margin-top: 52px;
          }
        }
      `}</style>
    </section>
  );
}

function HeroBenefitIcon({ kind }: { kind: HeroBenefit["icon"] }) {
  switch (kind) {
    case "breakfast":
      return <Coffee size={16} strokeWidth={1.8} />;
    case "wifi":
      return <Wifi size={16} strokeWidth={1.8} />;
    case "pool":
      return <Waves size={16} strokeWidth={1.8} />;
    case "air":
      return <Snowflake size={16} strokeWidth={1.8} />;
    case "workspace":
      return <Monitor size={16} strokeWidth={1.8} />;
    case "parking":
      return <SquareParking size={16} strokeWidth={1.8} />;
    case "dining":
      return <UtensilsCrossed size={16} strokeWidth={1.8} />;
    case "restobar":
      return <GlassWater size={16} strokeWidth={1.8} />;
    default:
      return <Clock3 size={16} strokeWidth={1.8} />;
  }
}
