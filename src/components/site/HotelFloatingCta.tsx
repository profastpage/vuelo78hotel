"use client";

import { CalendarDays, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SiteContent } from "@/types/site";
import { HotelBookingBar } from "./HotelBookingBar";
import { getHotelUi, type HotelLocale } from "@/lib/hotel-experience";

type HotelFloatingCtaProps = {
  bookingWidget: NonNullable<SiteContent["bookingWidget"]>;
  brandName: string;
  contactPhone: string;
  isOpen: boolean;
  label: string;
  locale: HotelLocale;
  note: string;
  onOpenChange: (open: boolean) => void;
  onSelectedRoomChange?: (roomId: string) => void;
  selectedRoomId?: string;
};

export function HotelFloatingCta({
  bookingWidget,
  brandName,
  contactPhone,
  isOpen,
  label,
  locale,
  note,
  onOpenChange,
  onSelectedRoomChange,
  selectedRoomId,
}: HotelFloatingCtaProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const ui = getHotelUi(locale);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
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
  }, [isOpen, onOpenChange]);

  return (
    <div className={`hotel-reference-mobile-float${isOpen ? " is-open" : ""}`} ref={shellRef}>
      <button
        aria-controls="hotel-floating-booking-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? ui.floating.close : `${label}. ${note}`}
        className="hotel-reference-mobile-float-trigger"
        onClick={() => onOpenChange(!isOpen)}
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
        <div className="hotel-reference-mobile-float-panel" id="hotel-floating-booking-panel" role="dialog" aria-label={ui.floating.title}>
          <div className="hotel-reference-mobile-float-panel-head">
            <div>
              <span className="scene-chip">{ui.floating.chip}</span>
              <strong>{ui.floating.title}</strong>
              <p>{ui.floating.description}</p>
            </div>
            <button
              aria-label={ui.floating.close}
              className="hotel-reference-mobile-float-close"
              onClick={() => onOpenChange(false)}
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
            locale={locale}
            onSelectedRoomChange={onSelectedRoomChange}
            onSubmitComplete={() => onOpenChange(false)}
            selectedRoomId={selectedRoomId}
          />
        </div>
      ) : null}
    </div>
  );
}
