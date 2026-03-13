type ExperienceGalleryItem = {
  imagePosition?: { x?: number; y?: number };
  imageSrc?: string;
  subtitle: string;
  title: string;
};

type HotelPremiumExperienceGalleryProps = {
  items: ExperienceGalleryItem[];
};

export function HotelPremiumExperienceGallery({ items }: HotelPremiumExperienceGalleryProps) {
  return (
    <section className="scene hotel-deluxe-section hotel-deluxe-experience" id="experiencia">
      <div className="hotel-deluxe-section-heading hotel-deluxe-experience-heading">
        <span className="scene-chip">Experiencia Vuelo 78 Hotel</span>
        <h2>Piscina, habitaciones y espacios pensados para disfrutar tu estadia.</h2>
        <p>Conoce el ambiente del hotel antes de reservar y descubre una experiencia comoda, tranquila y cercana.</p>
      </div>

      <div className="hotel-deluxe-experience-grid">
        {items.map((item, index) => (
          <article className={`hotel-deluxe-experience-card card-${index + 1}`} key={`${item.title}-${index}`}>
            <div
              className={`hotel-deluxe-experience-media${item.imageSrc ? " has-media-image" : " media-fallback-hotel"}`}
              style={getExperienceMediaStyle(item.imageSrc, item.imagePosition)}
            />
            <div className="hotel-deluxe-experience-copy">
              <span>{item.subtitle}</span>
              <strong>{item.title}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getExperienceMediaStyle(imageSrc?: string, position?: { x?: number; y?: number }) {
  const x = typeof position?.x === "number" ? position.x : 50;
  const y = typeof position?.y === "number" ? position.y : 50;

  if (!imageSrc) {
    return undefined;
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(8, 18, 32, 0.06), rgba(8, 18, 32, 0.28)), url("${imageSrc}")`,
    backgroundPosition: `${x}% ${y}%`,
  };
}
