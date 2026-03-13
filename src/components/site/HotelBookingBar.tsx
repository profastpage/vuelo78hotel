"use client";

import { BedDouble, CalendarDays, MessageSquareText, MoonStar, UserRound, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteContent } from "@/types/site";

type HotelBookingBarProps = {
  brandName: string;
  contactPhone: string;
  bookingWidget: NonNullable<SiteContent["bookingWidget"]>;
};

export function HotelBookingBar({ brandName, contactPhone, bookingWidget }: HotelBookingBarProps) {
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
  const cleanPhone = useMemo(() => String(contactPhone || "").replace(/[^\d]/g, ""), [contactPhone]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cleanPhone || !selectedRoom) {
      return;
    }

    const lines = [
      `Hola, quiero reservar en ${brandName}.`,
      "",
      `Habitacion: ${selectedRoom.label}`,
      checkIn ? `Entrada: ${formatHumanDate(checkIn)}` : null,
      checkOut ? `Salida: ${formatHumanDate(checkOut)}` : null,
      stayNights ? `Estadia: ${stayNights} ${stayNights === 1 ? "noche" : "noches"}` : null,
      guests ? `Huespedes: ${guests}` : null,
      selectedRoom.price ? `Tarifa referencial: ${selectedRoom.price} ${selectedRoom.rateLabel}` : null,
      notes.trim() ? `Solicitud especial: ${notes.trim()}` : null,
      "",
      "Quedo atento a disponibilidad y confirmacion.",
    ].filter(Boolean);

    const href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(href, "_blank", "noopener,noreferrer");
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
      <form className="hotel-reference-booking-bar hotel-home-booking-form" id="reserva" onSubmit={handleSubmit}>
        <label
          className="hotel-reference-booking-field hotel-reference-booking-input hotel-home-booking-field is-interactive"
          onClick={() => openField(roomSelectRef.current)}
        >
          <div className="hotel-deluxe-booking-label-row">
            <span>{bookingWidget.detailLabel || "Habitacion"}</span>
            <span className="hotel-deluxe-booking-field-icon" aria-hidden="true">
              <BedDouble size={17} strokeWidth={1.8} />
            </span>
          </div>
          <select
            aria-label={bookingWidget.detailLabel || "Habitacion"}
            onChange={(event) => setRoomId(event.target.value)}
            ref={roomSelectRef}
            value={roomId}
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} · {option.price}
              </option>
            ))}
          </select>
        </label>

        <label
          className="hotel-reference-booking-field hotel-reference-booking-input hotel-home-booking-field is-interactive"
          onClick={() => openField(checkInRef.current)}
        >
          <div className="hotel-deluxe-booking-label-row">
            <span>{bookingWidget.scheduleLabel || "Entrada"}</span>
            <span className="hotel-deluxe-booking-field-icon" aria-hidden="true">
              <CalendarDays size={17} strokeWidth={1.8} />
            </span>
          </div>
          <input
            aria-label={bookingWidget.scheduleLabel || "Entrada"}
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
            <span>{bookingWidget.timelineLabel || "Salida"}</span>
            <span className="hotel-deluxe-booking-field-icon" aria-hidden="true">
              <MoonStar size={17} strokeWidth={1.8} />
            </span>
          </div>
          <input
            aria-label={bookingWidget.timelineLabel || "Salida"}
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
            <span>{bookingWidget.quantityLabel || "Huespedes"}</span>
            <span className="hotel-deluxe-booking-field-icon" aria-hidden="true">
              <Users size={17} strokeWidth={1.8} />
            </span>
          </div>
          <select
            aria-label={bookingWidget.quantityLabel || "Huespedes"}
            onChange={(event) => setGuests(event.target.value)}
            ref={guestSelectRef}
            value={guests}
          >
            {(bookingWidget.quantityOptions?.length ? bookingWidget.quantityOptions : ["1", "2", "3", "4", "5+"]).map((option) => (
              <option key={option} value={option}>
                {option} {option === "1" ? "huesped" : "huespedes"}
              </option>
            ))}
          </select>
        </label>

        <label className="hotel-reference-booking-field hotel-reference-booking-input hotel-home-booking-field hotel-home-booking-field-notes">
          <div className="hotel-deluxe-booking-label-row">
            <span>{bookingWidget.notesLabel || "Solicitud especial"}</span>
            <span className="hotel-deluxe-booking-field-icon" aria-hidden="true">
              <MessageSquareText size={17} strokeWidth={1.8} />
            </span>
          </div>
          <input
            aria-label={bookingWidget.notesLabel || "Solicitud especial"}
            maxLength={120}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={bookingWidget.notesPlaceholder || "Cama extra, early check-in, traslado..."}
            type="text"
            value={notes}
          />
          <small>{notes.trim() ? `${notes.trim().length}/120` : "Opcional"}</small>
        </label>

        <button className="hotel-reference-booking-button hotel-deluxe-booking-submit hotel-home-booking-submit" type="submit">
          <UserRound size={18} strokeWidth={1.9} />
          {bookingWidget.bookingCtaLabel || "Reservar"}
        </button>
      </form>

      {selectedRoom ? (
        <div className="hotel-reference-booking-summary hotel-home-booking-summary" aria-live="polite">
          <span>{selectedRoom.badge || bookingWidget.selectionTitle || "Seleccion actual"}</span>
          <strong>{selectedRoom.label}</strong>
          <b>{selectedRoom.price}</b>
          <small>
            {stayNights ? `${stayNights} ${stayNights === 1 ? "noche" : "noches"}` : selectedRoom.stayLabel}
            {" · "}
            {guests} {guests === "1" ? "huesped" : "huespedes"}
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

function formatHumanDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
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
