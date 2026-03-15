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
  rooms: Array<
    HotelRoomGalleryEntry & {
      reservationHref: string;
    }
  >;
};

export function HotelRoomGallerySection({
  eyebrow,
  locale,
  rooms,
  sectionId,
  summary,
  title,
}: HotelRoomGallerySectionProps) {
  const copy =
    locale === "en"
      ? {
          chip: "Curated collection",
          cta: "Book this room",
          details: "Room details",
          price: "Reference rate",
          heading: "Rooms curated with the best angles only",
          summary: "Each gallery keeps the strongest room shots and converts the room card into clean, readable content.",
        }
      : {
          chip: "Coleccion curada",
          cta: "Reservar esta habitacion",
          details: "Detalles de la habitacion",
          price: "Tarifa referencial",
          heading: "Habitaciones curadas solo con las mejores vistas",
          summary: "Cada galeria conserva las mejores tomas y convierte la ficha de imagen en contenido legible dentro de la interfaz.",
        };

  return (
    <section className="scene hotel-room-gallery-section" data-animate data-animate-delay="150" id={sectionId}>
      <div className="hotel-reference-section-heading">
        <span className="scene-chip">{eyebrow || copy.chip}</span>
        <h2>{renderBalancedSectionTitle(title || copy.heading)}</h2>
        <p>{summary || copy.summary}</p>
      </div>

      <div className="hotel-room-gallery-list">
        {rooms.map((room) => (
          <article className="hotel-room-gallery-card" id={room.slug} key={room.slug}>
            <div className="hotel-room-gallery-card-head">
              <div className="hotel-room-gallery-card-copy">
                <span className="scene-chip scene-chip-inline">{room.summary}</span>
              </div>
              <a className="primary-button hotel-room-gallery-cta" href={room.reservationHref}>
                {copy.cta}
              </a>
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

                {room.details.price ? (
                  <div className="hotel-room-gallery-price-block">
                    <span>{copy.price}</span>
                    <strong>{room.details.price}</strong>
                  </div>
                ) : null}
              </aside>

              <HotelRoomGalleryCarousel locale={locale} roomTitle={room.title} slides={room.slides} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
