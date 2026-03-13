"use client";

import { CalendarDays, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/types/site";
import { HotelBookingBar } from "./HotelBookingBar";

type HotelFloatingCtaProps = {
  bookingWidget: NonNullable<SiteContent["bookingWidget"]>;
  brandName: string;
  contactPhone: string;
  label: string;
  note: string;
};

export function HotelFloatingCta({
  bookingWidget,
  brandName,
  contactPhone,
  label,
  note,
}: HotelFloatingCtaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`hotel-reference-mobile-float${isOpen ? " is-open" : ""}`} ref={shellRef}>
      <button
        aria-controls="hotel-floating-booking-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar widget de reserva" : `${label}. ${note}`}
        className="hotel-reference-mobile-float-trigger"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="hotel-reference-mobile-float-word" aria-hidden="true">
          <span>Reserva</span>
          <span>Directa</span>
        </span>
        <span className="hotel-reference-mobile-float-button">
          <span className="hotel-reference-mobile-float-icon" aria-hidden="true">
            <CalendarDays size={18} strokeWidth={2} />
          </span>
          <span className="hotel-reference-mobile-float-copy">
            <span className="hotel-reference-mobile-float-label">{label}</span>
            <span className="hotel-reference-mobile-float-note">{note}</span>
          </span>
        </span>
      </button>

      {isOpen ? (
        <div className="hotel-reference-mobile-float-panel" id="hotel-floating-booking-panel" role="dialog" aria-label="Reserva rapida">
          <div className="hotel-reference-mobile-float-panel-head">
            <div>
              <span className="scene-chip">Reserva rapida</span>
              <strong>Confirma tu estadia</strong>
              <p>Selecciona habitacion, fechas y huespedes. Al reservar se abrira WhatsApp con el resumen listo.</p>
            </div>
            <button
              aria-label="Cerrar reserva rapida"
              className="hotel-reference-mobile-float-close"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>

          <HotelBookingBar
            bookingWidget={bookingWidget}
            brandName={brandName}
            compact
            contactPhone={contactPhone}
            hideNotes
            onSubmitComplete={() => setIsOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
