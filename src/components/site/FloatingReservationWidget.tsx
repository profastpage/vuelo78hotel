"use client";

import { useMemo } from "react";
import { resolveBookingWidget } from "@/lib/booking-widget";
import type { SiteContent } from "@/types/site";

type FloatingReservationWidgetProps = {
  content: SiteContent;
  isLocalEnvironment?: boolean;
};

export function FloatingReservationWidget({ content, isLocalEnvironment = false }: FloatingReservationWidgetProps) {
  const widgetCopy = useMemo(() => resolveBookingWidget(content), [content]);
  const cleanWhatsappNumber = String(content.contact.whatsappNumber || "").replace(/[^\d]/g, "");

  if (!cleanWhatsappNumber) {
    return null;
  }

  const ctaLabel = resolveLuxuryWidgetLabel(
    widgetCopy.bookingCtaLabel,
    widgetCopy.directWhatsappLabel,
    widgetCopy.triggerActionLabel,
  );
  const whatsappHref = buildLuxuryWhatsappHref(cleanWhatsappNumber, content.brand.name, ctaLabel);

  return (
    <div className={`floating-live-widget floating-live-widget--luxury${isLocalEnvironment ? " is-local-env" : ""}`}>
      <a
        aria-label={`${ctaLabel} por WhatsApp`}
        className="floating-live-widget-trigger"
        href={whatsappHref}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span className="floating-live-widget-trigger-aura" aria-hidden="true" />
        <span className="floating-live-widget-trigger-icon" aria-hidden="true">
          <LuxuryWhatsappIcon />
        </span>
        <span className="floating-live-widget-trigger-copy">
          <small>WhatsApp directo</small>
          <strong>{ctaLabel}</strong>
        </span>
        <span className="floating-live-widget-trigger-arrow" aria-hidden="true">
          <LuxuryArrowIcon />
        </span>
      </a>
    </div>
  );
}

function resolveLuxuryWidgetLabel(...candidates: Array<string | undefined>) {
  const preferred = candidates
    .map((item) => item?.trim())
    .find((item) => item && item.length >= 8 && item.length <= 20);

  return preferred || "Reservar ahora";
}

function buildLuxuryWhatsappHref(whatsappNumber: string, brandName: string, ctaLabel: string) {
  const hotelName = brandName.trim() || "el hotel";
  const message = [
    `Hola, quiero ${ctaLabel.toLowerCase()} en ${hotelName}.`,
    "¿Podrian ayudarme con disponibilidad y tarifas por WhatsApp?",
  ].join("\n");

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function LuxuryWhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
      <path d="M12 20a7.8 7.8 0 0 0 7.7-7.8A7.8 7.8 0 0 0 12 4.4a7.8 7.8 0 0 0-7.8 7.8c0 1.4.4 2.8 1.1 4L4.2 20l3.9-1a7.7 7.7 0 0 0 3.9 1Z" />
      <path d="M9.3 9.2c.3-.6.6-.7 1-.7.2 0 .4 0 .6.5l.5 1.2c.1.3.1.5-.1.7l-.4.5c-.1.2-.1.3 0 .5.3.6 1.1 1.8 2.6 2.4.2.1.3.1.5-.1l.6-.7c.2-.2.4-.2.7-.1l1.1.5c.4.2.5.3.5.5 0 .5-.3 1-.7 1.3-.4.3-.9.5-1.4.4-1.3-.2-2.6-.8-3.9-2.1-1.2-1.1-2-2.4-2.2-3.7-.1-.4 0-.9.3-1.4Z" />
    </svg>
  );
}

function LuxuryArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
      <path d="M7 12h10" />
      <path d="m13 8 4 4-4 4" />
    </svg>
  );
}
