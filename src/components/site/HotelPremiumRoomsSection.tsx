import { renderBalancedSectionTitle } from "./headline-balance";

type HotelPremiumRoom = {
  benefits: string[];
  description: string;
  imagePosition?: { x?: number; y?: number };
  imageSrc?: string;
  price: string;
  rateLabel?: string;
  reservationHref: string;
  title: string;
};

type HotelPremiumRoomsSectionProps = {
  eyebrow: string;
  rooms: HotelPremiumRoom[];
  subtitle: string;
  title: string;
};

export function HotelPremiumRoomsSection({ eyebrow, rooms, subtitle, title }: HotelPremiumRoomsSectionProps) {
  return (
    <section className="scene hotel-deluxe-section hotel-deluxe-rooms" id="habitaciones">
      <div className="hotel-deluxe-section-heading">
        <span className="scene-chip">{eyebrow}</span>
        <h2>{renderBalancedSectionTitle(title)}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="hotel-deluxe-room-grid">
        {rooms.map((room) => (
          <article className="hotel-deluxe-room-card" key={room.title}>
            <div
              className={`hotel-deluxe-room-media${room.imageSrc ? " has-media-image" : " media-fallback-hotel"}`}
              style={getRoomMediaStyle(room.imageSrc, room.imagePosition)}
            />
            <div className="hotel-deluxe-room-body">
              <div className="hotel-deluxe-room-copy">
                <strong>{room.title}</strong>
                <p>{room.description}</p>
              </div>

              <ul className="hotel-deluxe-room-benefits" aria-label={`Beneficios de ${room.title}`}>
                {room.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>

              <div className="hotel-deluxe-room-footer">
                <div className="hotel-deluxe-room-price">
                  <b>{room.price}</b>
                  <span>{room.rateLabel || "por noche"}</span>
                </div>
                <a className="primary-button hotel-deluxe-room-cta" href={room.reservationHref}>
                  Reservar ahora
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getRoomMediaStyle(imageSrc?: string, position?: { x?: number; y?: number }) {
  const x = typeof position?.x === "number" ? position.x : 50;
  const y = typeof position?.y === "number" ? position.y : 50;

  if (!imageSrc) {
    return undefined;
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(9, 19, 36, 0.04), rgba(9, 19, 36, 0.26)), url("${imageSrc}")`,
    backgroundPosition: `${x}% ${y}%`,
  };
}
