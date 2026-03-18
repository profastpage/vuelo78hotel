"use client";

import { useId } from "react";
import { renderBalancedSectionTitle } from "./headline-balance";
import { HotelRoomGalleryCarousel } from "./HotelRoomGalleryCarousel";
import type { HotelLocale } from "@/lib/hotel-experience";
import type { HotelRoomGalleryEntry } from "@/lib/hotel-room-gallery";

type HotelRoomGallerySectionProps = {
  eyebrow?: string;
  locale: HotelLocale;
  sectionId?: string;
  summary?: string;
  title?: string;
  onReserveRoom?: (room: HotelRoomGalleryEntry) => void;
  rooms: Array<
    HotelRoomGalleryEntry & {
      reservationHref: string;
    }
  >;
};

export function HotelRoomGallerySection({
  eyebrow,
  locale,
  onReserveRoom,
  rooms,
  sectionId,
  summary,
  title,
}: HotelRoomGallerySectionProps) {
  const selectorId = useId();
  const copy =
    locale === "en"
      ? {
          jumpLabel: "Go to a room",
          jumpPlaceholder: "Choose a room",
          chip: "Curated collection",
          cta: "Book this room",
          details: "Room details",
          price: "Reference rate",
          heading: "Rooms curated with the best angles only",
          summary: "Each gallery keeps the strongest room shots and converts the room card into clean, readable content.",
        }
      : {
          jumpLabel: "Ir a una habitacion",
          jumpPlaceholder: "Elegir habitacion",
          chip: "Coleccion curada",
          cta: "Reservar esta habitacion",
          details: "Detalles de la habitacion",
          price: "Tarifa referencial",
          heading: "Habitaciones diseñadas para descansar",
          summary: "Habitaciones modernas, comodos, tranquilos y pensados para una estancia placentera,",
        };
  const resolvedSummary = summary && !summary.includes("Espacios") ? summary : copy.summary;

  return (
    <section className="scene hotel-room-gallery-section" id={sectionId}>
      <div className="hotel-reference-section-heading hotel-room-gallery-section-heading">
        <span className="scene-chip">{eyebrow || copy.chip}</span>
        <h2>{renderBalancedSectionTitle(title || copy.heading)}</h2>
        <p>{resolvedSummary}</p>
      </div>

      <div className="hotel-room-gallery-jump-shell">
        <label className="hotel-room-gallery-jump-label" htmlFor={selectorId}>
          {copy.jumpLabel}
        </label>
        <div className="hotel-room-gallery-jump-select-shell">
          <select
            className="hotel-room-gallery-jump-select"
            defaultValue=""
            id={selectorId}
            onChange={(event) => {
              const nextSlug = event.target.value;
              if (!nextSlug) {
                return;
              }

              document.getElementById(nextSlug)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <option value="">{copy.jumpPlaceholder}</option>
            {rooms.map((room) => (
              <option key={`${room.slug}-jump`} value={room.slug}>
                {room.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hotel-room-gallery-list">
        {rooms.map((room) => (
          <article className="hotel-room-gallery-card" id={room.slug} key={room.slug}>
            <div className="hotel-room-gallery-card-head">
              <div className="hotel-room-gallery-card-copy">
                <h3 className="hotel-room-gallery-card-title-mobile">{room.title}</h3>
                <div className="hotel-room-gallery-word-mark" aria-label={`${room.title}: signature words`}>
                  {room.signatureWords.slice(0, 3).map((word, index) => (
                    <span key={`${room.slug}-${word}`}>
                      {index > 0 ? <i aria-hidden="true">|</i> : null}
                      <b>{word}</b>
                    </span>
                  ))}
                </div>
              </div>
              {onReserveRoom ? (
                <button className="primary-button hotel-room-gallery-cta hotel-room-gallery-cta-desktop" onClick={() => onReserveRoom(room)} type="button">
                  {copy.cta}
                </button>
              ) : (
                <a className="primary-button hotel-room-gallery-cta hotel-room-gallery-cta-desktop" href={room.reservationHref}>
                  {copy.cta}
                </a>
              )}
              <span aria-hidden="true" className="hotel-room-gallery-card-spacer" />
            </div>

            <div className="hotel-room-gallery-card-body">
              <aside className="hotel-room-gallery-details">
                <div className="hotel-room-gallery-details-copy">
                  <strong>{copy.details}</strong>
                  <h3>{room.title}</h3>
                  <p>{room.summary}</p>
                </div>

                <ul className="hotel-room-gallery-feature-list" aria-label={room.title}>
                  {room.details.features.map((feature) => (
                    <li key={`${room.slug}-${feature}`}>{feature}</li>
                  ))}
                </ul>

                <div className="hotel-room-gallery-footer">
                  {room.details.price ? (
                    <div className="hotel-room-gallery-price-block">
                      <span>{copy.price}</span>
                      <strong>{room.details.price}</strong>
                    </div>
                  ) : null}

                  {onReserveRoom ? (
                    <button className="primary-button hotel-room-gallery-cta hotel-room-gallery-cta-mobile" onClick={() => onReserveRoom(room)} type="button">
                      {copy.cta}
                    </button>
                  ) : (
                    <a className="primary-button hotel-room-gallery-cta hotel-room-gallery-cta-mobile" href={room.reservationHref}>
                      {copy.cta}
                    </a>
                  )}
                </div>
              </aside>

              <HotelRoomGalleryCarousel locale={locale} roomTitle={room.title} slides={room.slides} />
            </div>
          </article>
        ))}
      </div>

      <style jsx global>{`
        .hotel-room-gallery-jump-shell {
          display: grid;
          gap: 12px;
          width: min(100%, 520px);
          margin: 0 auto clamp(22px, 3vw, 34px);
        }

        .hotel-room-gallery-jump-label {
          color: #a98344;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          text-align: center;
        }

        .hotel-room-gallery-jump-select-shell {
          position: relative;
          border-radius: 999px;
          border: 1px solid rgba(186, 146, 77, 0.26);
          background:
            radial-gradient(circle at top, rgba(255, 247, 227, 0.82), transparent 58%),
            linear-gradient(180deg, rgba(248, 231, 188, 0.96), rgba(219, 179, 103, 0.9));
          box-shadow:
            0 18px 34px rgba(120, 86, 35, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.78),
            inset 0 -10px 18px rgba(144, 104, 41, 0.12);
        }

        .hotel-room-gallery-jump-select-shell::after {
          content: "";
          position: absolute;
          top: 50%;
          right: 24px;
          width: 10px;
          height: 10px;
          border-right: 2px solid rgba(90, 60, 20, 0.86);
          border-bottom: 2px solid rgba(90, 60, 20, 0.86);
          transform: translateY(-68%) rotate(45deg);
          pointer-events: none;
        }

        .hotel-room-gallery-jump-select {
          width: 100%;
          min-height: 64px;
          padding: 0 62px 0 24px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #5c431f;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          appearance: none;
          outline: none;
          cursor: pointer;
        }

        @media (max-width: 860px) {
          .hotel-room-gallery-jump-shell {
            width: 100%;
            margin-bottom: 22px;
          }

          .hotel-room-gallery-jump-select {
            min-height: 58px;
            padding-inline: 20px 54px;
            font-size: 0.96rem;
          }

          .hotel-room-gallery-jump-select-shell::after {
            right: 20px;
          }
        }
      `}</style>
    </section>
  );
}
