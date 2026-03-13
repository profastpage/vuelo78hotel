"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteContent } from "@/types/site";

type HotelBookingBarProps = {
  brandName: string;
  contactPhone: string;
  bookingWidget: NonNullable<SiteContent["bookingWidget"]>;
};

type PromoRule = {
  code: string;
  discount: number;
  note: string;
};

const PROMO_RULES: PromoRule[] = [
  { code: "VUELO78", discount: 12, note: "Descuento web sujeto a validacion de recepcion." },
  { code: "TARAPOTO10", discount: 10, note: "Descuento por reserva directa sujeto a disponibilidad." },
  { code: "SUITE15", discount: 15, note: "Descuento especial para suites seleccionado en la web." },
];

export function HotelBookingBar({ brandName, contactPhone, bookingWidget }: HotelBookingBarProps) {
  const options = bookingWidget.options?.length ? bookingWidget.options : [];
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomId, setRoomId] = useState(options[0]?.id ?? "");
  const [promoCode, setPromoCode] = useState("");
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const roomSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (checkIn || checkOut) {
      return;
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    setCheckIn(formatDate(now));
    setCheckOut(formatDate(tomorrow));
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

    if (new Date(checkOut) <= new Date(checkIn)) {
      const next = new Date(checkIn);
      next.setDate(next.getDate() + 1);
      setCheckOut(formatDate(next));
    }
  }, [checkIn, checkOut]);

  const selectedRoom = useMemo(
    () => options.find((option) => option.id === roomId) ?? options[0],
    [options, roomId],
  );
  const stayNights = useMemo(() => getNightCount(checkIn, checkOut), [checkIn, checkOut]);
  const matchedPromo = useMemo(
    () => PROMO_RULES.find((rule) => rule.code === promoCode.trim().toUpperCase()),
    [promoCode],
  );
  const basePrice = selectedRoom ? parseCurrencyValue(selectedRoom.price) : null;
  const discountedPrice =
    matchedPromo && typeof basePrice === "number"
      ? Math.max(0, Math.round(basePrice * (1 - matchedPromo.discount / 100)))
      : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanPhone = String(contactPhone || "").replace(/[^\d]/g, "");
    if (!cleanPhone || !selectedRoom) {
      return;
    }

    const lines = [
      "Hola, quiero reservar en " + brandName + ".",
      "",
      checkIn ? `Entrada: ${formatHumanDate(checkIn)}` : "Entrada: por definir",
      checkOut ? `Salida: ${formatHumanDate(checkOut)}` : "Salida: por definir",
      stayNights ? `Estadia: ${stayNights} ${stayNights === 1 ? "noche" : "noches"}` : null,
      `Habitacion: ${selectedRoom.label}`,
      selectedRoom.price ? `Tarifa referencial: ${selectedRoom.price} ${selectedRoom.rateLabel}` : null,
      promoCode ? `Codigo promocional: ${promoCode.trim().toUpperCase()}` : "Codigo promocional: ninguno",
      matchedPromo ? `Descuento sugerido: ${matchedPromo.discount}%` : null,
      matchedPromo?.note ?? null,
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
      <form className="hotel-reference-booking-bar" id="reserva" onSubmit={handleSubmit}>
        <label
          className="hotel-reference-booking-field hotel-reference-booking-input is-interactive"
          onClick={() => openField(checkInRef.current)}
        >
          <span>{bookingWidget.scheduleLabel || "Entrada"}</span>
          <input
            aria-label={bookingWidget.scheduleLabel || "Entrada"}
            ref={checkInRef}
            min={formatDate(new Date())}
            onChange={(event) => setCheckIn(event.target.value)}
            type="date"
            value={checkIn}
          />
        </label>

        <label
          className="hotel-reference-booking-field hotel-reference-booking-input is-interactive"
          onClick={() => openField(checkOutRef.current)}
        >
          <span>{bookingWidget.timelineLabel || "Salida"}</span>
          <input
            aria-label={bookingWidget.timelineLabel || "Salida"}
            ref={checkOutRef}
            min={checkIn || formatDate(new Date())}
            onChange={(event) => setCheckOut(event.target.value)}
            type="date"
            value={checkOut}
          />
        </label>

        <label
          className="hotel-reference-booking-field hotel-reference-booking-input is-interactive"
          onClick={() => openField(roomSelectRef.current)}
        >
          <span>{bookingWidget.detailLabel || "Habitacion"}</span>
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

        <label className="hotel-reference-booking-field hotel-reference-booking-input">
          <span>{bookingWidget.summaryLabel || "Codigo promocional"}</span>
          <input
            aria-label={bookingWidget.summaryLabel || "Codigo promocional"}
            maxLength={18}
            onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
            placeholder={bookingWidget.summaryText || "Opcional"}
            type="text"
            value={promoCode}
          />
          <small aria-live="polite">
            {matchedPromo
              ? `${matchedPromo.discount}% aplicado`
              : promoCode.trim()
                ? "Sin descuento activo"
                : bookingWidget.summaryText || "Opcional"}
          </small>
        </label>

        <button className="hotel-reference-booking-button" type="submit">
          {bookingWidget.bookingCtaLabel || "Reservar"}
        </button>
      </form>

      {selectedRoom ? (
        <div className="hotel-reference-booking-summary" aria-live="polite">
          <span>{stayNights ? `${stayNights} ${stayNights === 1 ? "noche" : "noches"}` : selectedRoom.stayLabel}</span>
          <strong>{selectedRoom.label}</strong>
          <b>{discountedPrice ? `S/ ${discountedPrice}` : selectedRoom.price}</b>
          <small>{matchedPromo ? matchedPromo.note : selectedRoom.summary}</small>
        </div>
      ) : null}
    </>
  );
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
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

function parseCurrencyValue(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
