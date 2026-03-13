type HotelPremiumAmenity = {
  description: string;
  icon: string;
  title: string;
};

type HotelPremiumAmenitiesProps = {
  items: HotelPremiumAmenity[];
};

export function HotelPremiumAmenities({ items }: HotelPremiumAmenitiesProps) {
  return (
    <section className="scene hotel-deluxe-section hotel-deluxe-amenities" id="servicios">
      <div className="hotel-deluxe-section-heading">
        <span className="scene-chip">Servicios y amenities</span>
        <h2>Todo lo necesario para una estancia comoda en Tarapoto.</h2>
        <p>Amenities esenciales para descansar mejor, coordinar tu viaje con facilidad y reservar directo con confianza.</p>
      </div>

      <div className="hotel-deluxe-amenity-strip" role="list" aria-label="Servicios del hotel">
        {items.map((item, index) => (
          <article className="hotel-deluxe-amenity-item" key={item.title} role="listitem" aria-label={`${item.title}. ${item.description}`}>
            <span className="hotel-deluxe-amenity-icon" aria-hidden="true">
              {renderAmenityIcon(item.icon, index)}
            </span>
            <strong>{item.title}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function renderAmenityIcon(icon: string, index: number) {
  const iconId = icon || String(index);
  const commonProps = {
    fill: "none",
    height: 18,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
    width: 18,
  };

  switch (iconId) {
    case "breakfast":
      return (
        <svg {...commonProps}>
          <path d="M4 13h16" />
          <path d="M6 13V8a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v4" />
          <path d="M16 8a2 2 0 1 1 4 0v5" />
          <path d="M5 17h14" />
        </svg>
      );
    case "wifi":
      return (
        <svg {...commonProps}>
          <path d="M3.5 9.5a13 13 0 0 1 17 0" />
          <path d="M6.5 12.5a8.5 8.5 0 0 1 11 0" />
          <path d="M9.8 15.5a4 4 0 0 1 4.4 0" />
          <path d="M12 19h.01" />
        </svg>
      );
    case "pool":
      return (
        <svg {...commonProps}>
          <path d="M4 15c1.4 0 1.4-1 2.8-1s1.4 1 2.8 1 1.4-1 2.8-1 1.4 1 2.8 1 1.4-1 2.8-1 1.4 1 2.8 1" />
          <path d="M7 12V5h4l2 3h4v4" />
        </svg>
      );
    case "air":
      return (
        <svg {...commonProps}>
          <path d="M4 9h16" />
          <path d="M6 6h12" />
          <path d="M7 12c0 1.2 1 2 2.2 2S11.5 13.2 11.5 12" />
          <path d="M12.5 12c0 1.2 1 2 2.2 2S17 13.2 17 12" />
          <path d="M8 17c.7.6 1.4 1 2.3 1" />
          <path d="M13.7 18c.9 0 1.6-.4 2.3-1" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M4 11.5 12 5l8 6.5" />
          <path d="M6 10.5V17h12v-6.5" />
          <path d="M9 17v-3h6v3" />
        </svg>
      );
  }
}
