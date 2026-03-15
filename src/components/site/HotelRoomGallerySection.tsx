import { renderBalancedSectionTitle } from "./headline-balance";
import { HotelRoomGalleryCarousel } from "./HotelRoomGalleryCarousel";
import type { HotelLocale } from "@/lib/hotel-experience";
import type { HotelRoomGalleryEntry } from "@/lib/hotel-room-gallery";

type HotelRoomGallerySectionProps = {
  locale: HotelLocale;
  rooms: Array<
    HotelRoomGalleryEntry & {
      reservationHref: string;
    }
  >;
};

export function HotelRoomGallerySection({ locale, rooms }: HotelRoomGallerySectionProps) {
  const copy =
    locale === "en"
      ? {
          chip: "Curated collection",
          cta: "Book this room",
          ficha: "Information card outside the carousel",
          heading: "Rooms curated with the best angles only",
          summary: "Each gallery keeps the strongest room shots, removes duplicates and leaves the descriptive card outside the slider.",
        }
      : {
          chip: "Coleccion curada",
          cta: "Reservar esta habitacion",
          ficha: "Ficha descriptiva fuera del carrusel",
          heading: "Habitaciones curadas solo con las mejores vistas",
          summary: "Cada galeria conserva las tomas mas claras de la habitacion, elimina duplicados y deja la ficha descriptiva fuera del slider.",
        };

  return (
    <section className="scene hotel-room-gallery-section" data-animate data-animate-delay="150">
      <div className="hotel-reference-section-heading">
        <span className="scene-chip">{copy.chip}</span>
        <h2>{renderBalancedSectionTitle(copy.heading)}</h2>
        <p>{copy.summary}</p>
      </div>

      <div className="hotel-room-gallery-list">
        {rooms.map((room) => (
          <article className="hotel-room-gallery-card" id={room.slug} key={room.slug}>
            <div className="hotel-room-gallery-card-head">
              <div className="hotel-room-gallery-card-copy">
                <span className="scene-chip scene-chip-inline">{room.summary}</span>
                <h3>{room.title}</h3>
              </div>
              <a className="primary-button hotel-room-gallery-cta" href={room.reservationHref}>
                {copy.cta}
              </a>
            </div>

            <div className="hotel-room-gallery-card-body">
              <aside className="hotel-room-gallery-ficha">
                <div className="hotel-room-gallery-ficha-copy">
                  <strong>{copy.ficha}</strong>
                  <p>{room.summary}</p>
                </div>
                <div className="hotel-room-gallery-ficha-media">
                  <picture>
                    <source sizes="(max-width: 860px) 100vw, 26vw" srcSet={room.ficha.webpSrc} type="image/webp" />
                    <img
                      alt={room.ficha.alt}
                      className="hotel-room-gallery-ficha-image"
                      decoding="async"
                      loading="lazy"
                      sizes="(max-width: 860px) 100vw, 26vw"
                      src={room.ficha.jpgSrc}
                    />
                  </picture>
                </div>
              </aside>

              <HotelRoomGalleryCarousel locale={locale} roomTitle={room.title} slides={room.slides} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
