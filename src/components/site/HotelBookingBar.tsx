"use client";

import { BedDouble, CalendarDays, MessageSquareText, MoonStar, UserRound, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteContent } from "@/types/site";
import { buildHotelWhatsAppHref, getHotelUi, type HotelLocale } from "@/lib/hotel-experience";

type HotelBookingBarProps = {
  brandName: string;
  contactPhone: string;
  bookingWidget: NonNullable<SiteContent["bookingWidget"]>;
  locale?: HotelLocale;
  compact?: boolean;
  hideNotes?: boolean;
  onSubmitComplete?: () => void;
};

export function HotelBookingBar({
  brandName,
  contactPhone,
  bookingWidget,
  locale = "es",
  compact = false,
  hideNotes = false,
  onSubmitComplete,
}: HotelBookingBarProps) {
  const ui = getHotelUi(locale);
  const options = bookingWidget.options?.length ? bookingWidget.options : [];
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomId, setRoomId] = useState(options[0]?.id ?? "");
  const [guests, setGuests] = useState(bookingWidget.quantityOptions?.[1] || bookingWidget.quantityOptions?.[0] || "2");
  const [notes, setNotes] = useState("");

  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const roomSelectRef = useRef<HTMLSelectElement>(null);
  const guestSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (checkIn || checkOut) {
      return;
    }

    const start = new Date();
    start.setDate(start.getDate() + 1);

    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    setCheckIn(formatInputDate(start));
    setCheckOut(formatInputDate(end));
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (!options.length) {
      return;
    }

    if (!options.some((option) => option.id === roomId)) {
      setRoomId(options[0].id);
    }
  }, [options, roomId]);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      return;
    }

    if (new Date(`${checkOut}T00:00:00`) <= new Date(`${checkIn}T00:00:00`)) {
      const next = new Date(`${checkIn}T00:00:00`);
      next.setDate(next.getDate() + 1);
      setCheckOut(formatInputDate(next));
    }
  }, [checkIn, checkOut]);

  const selectedRoom = useMemo(
    () => options.find((option) => option.id === roomId) ?? options[0],
    [options, roomId],
  );

  const stayNights = useMemo(() => getNightCount(checkIn, checkOut), [checkIn, checkOut]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRoom) {
      return;
    }

    const href = buildHotelWhatsAppHref({
      locale,
      hotelName: brandName,
      intent: "widget",
      sourceLabel: compact ? ui.floating.title : ui.hero.bookingKicker,
      roomLabel: selectedRoom.label,
      checkIn,
      checkOut,
      nights: stayNights,
      guests,
      price: selectedRoom.price,
      rateLabel: selectedRoom.rateLabel,
      notes: notes.trim(),
    });

    window.open(href, "_blank", "noopener,noreferrer");
    onSubmitComplete?.();
  }

  function openField(control: HTMLInputElement | HTMLSelectElement | null) {
    if (!control) {
      return;
    }

    control.focus();

    if ("showPicker" in control && typeof control.showPicker === "function") {
      control.showPicker();
      return;
    }

    control.click();
  }

  return (
    <>
      <form className="hotel-reference-booking-bar hotel-home-booking-form" id={compact ? undefined : "reserva"} onSubmit={handleSubmit}>
        <label
          className="hotel-reference-booking-field hotel-reference-booking-input hotel-home-booking-field is-interactive"
          onClick={() => openField(roomSelectRef.current)}
        >
          <div className="hotel-deluxe-booking-label-row">
            <span>{bookingWidget.detailLabel || (locale === "en" ? "Room" : "Habitacion")}</span>
            <span className="hotel-deluxe-booking-field-icon" aria-hidden="true">
              <BedDouble size={17} strokeWidth={1.8} />
            </span>
          </div>
          <select aria-label={bookingWidget.detailLabel || (locale === "en" ? "Room" : "Habitacion")} onChange={(event) => setRoomId(event.target.value)} ref={roomSelectRef} value={roomId}>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} - {option.price}
              </option>
            ))}
          </select>
        </label>

        <label
          className="hotel-reference-booking-field hotel-reference-booking-input hotel-home-booking-field is-interactive"
          onClick={() => openField(checkInRef.current)}
        >
          <div className="hotel-deluxe-booking-label-row">
            <span>{bookingWidget.scheduleLabel || (locale === "en" ? "Check-in" : "Entrada")}</span>
            <span className="hotel-deluxe-booking-field-icon" aria-hidden="true">
              <CalendarDays size={17} strokeWidth={1.8} />
            </span>
          </div>
          <input
            aria-label={bookingWidget.scheduleLabel || (locale === "en" ? "Check-in" : "Entrada")}
            min={formatInputDate(new Date())}
            onChange={(event) => setCheckIn(event.target.value)}
            ref={checkInRef}
            type="date"
            value={checkIn}
          />
        </label>

        <label
          className="hotel-reference-booking-field hotel-reference-booking-input hotel-home-booking-field is-interactive"
          onClick={() => openField(checkOutRef.current)}
        >
          <div className="hotel-deluxe-booking-label-row">
            <span>{bookingWidget.timelineLabel || (locale === "en" ? "Check-out" : "Salida")}</span>
            <span className="hotel-deluxe-booking-field-icon" aria-hidden="true">
              <MoonStar size={17} strokeWidth={1.8} />
            </span>
          </div>
          <input
            aria-label={bookingWidget.timelineLabel || (locale === "en" ? "Check-out" : "Salida")}
            min={checkIn || formatInputDate(new Date())}
            onChange={(event) => setCheckOut(event.target.value)}
            ref={checkOutRef}
            type="date"
            value={checkOut}
          />
        </label>

        <label
          className="hotel-reference-booking-field hotel-reference-booking-input hotel-home-booking-field is-interactive"
          onClick={() => openField(guestSelectRef.current)}
        >
          <div className="hotel-deluxe-booking-label-row">
            <span>{bookingWidget.quantityLabel || (locale === "en" ? "Guests" : "Huespedes")}</span>
            <span className="hotel-deluxe-booking-field-icon" aria-hidden="true">
              <Users size={17} strokeWidth={1.8} />
            </span>
          </div>
          <select aria-label={bookingWidget.quantityLabel || (locale === "en" ? "Guests" : "Huespedes")} onChange={(event) => setGuests(event.target.value)} ref={guestSelectRef} value={guests}>
            {(bookingWidget.quantityOptions?.length ? bookingWidget.quantityOptions : ["1", "2", "3", "4", "5+"]).map((option) => (
              <option key={option} value={option}>
                {option} {option === "1" ? (locale === "en" ? "guest" : "huesped") : locale === "en" ? "guests" : "huespedes"}
              </option>
            ))}
          </select>
        </label>

        {!hideNotes ? (
          <label className="hotel-reference-booking-field hotel-reference-booking-input hotel-home-booking-field hotel-home-booking-field-notes">
            <div className="hotel-deluxe-booking-label-row">
              <span>{bookingWidget.notesLabel || (locale === "en" ? "Special request" : "Solicitud especial")}</span>
              <span className="hotel-deluxe-booking-field-icon" aria-hidden="true">
                <MessageSquareText size={17} strokeWidth={1.8} />
              </span>
            </div>
            <input
              aria-label={bookingWidget.notesLabel || (locale === "en" ? "Special request" : "Solicitud especial")}
              maxLength={120}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={bookingWidget.notesPlaceholder || (locale === "en" ? "Extra bed, early check-in, transfer..." : "Cama extra, early check-in, traslado...")}
              type="text"
              value={notes}
            />
            <small>{notes.trim() ? `${notes.trim().length}/120` : bookingWidget.summaryText || (locale === "en" ? "Optional" : "Opcional")}</small>
          </label>
        ) : null}

        <button className={`hotel-reference-booking-button hotel-deluxe-booking-submit hotel-home-booking-submit${compact ? " is-compact" : ""}`} type="submit">
          <UserRound size={18} strokeWidth={1.9} />
          {bookingWidget.bookingCtaLabel || ui.floating.label}
        </button>
      </form>

      {selectedRoom ? (
        <div className="hotel-reference-booking-summary hotel-home-booking-summary" aria-live="polite">
          <span>{selectedRoom.badge || bookingWidget.selectionTitle || (locale === "en" ? "Current selection" : "Seleccion actual")}</span>
          <strong>{selectedRoom.label}</strong>
          <b>{selectedRoom.price}</b>
          <small>
            {stayNights
              ? `${stayNights} ${stayNights === 1 ? (locale === "en" ? "night" : "noche") : locale === "en" ? "nights" : "noches"}`
              : selectedRoom.stayLabel}
            {" - "}
            {guests} {guests === "1" ? (locale === "en" ? "guest" : "huesped") : locale === "en" ? "guests" : "huespedes"}
          </small>
        </div>
      ) : null}
    </>
  );
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNightCount(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const diff = end.getTime() - start.getTime();

  if (!Number.isFinite(diff) || diff <= 0) {
    return 0;
  }

  return Math.round(diff / 86400000);
}
