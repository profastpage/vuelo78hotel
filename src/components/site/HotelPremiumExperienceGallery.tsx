import { renderBalancedSectionTitle } from "./headline-balance";
import type { HotelLocale } from "@/lib/hotel-experience";
import { getHotelUi } from "@/lib/hotel-experience";

type ExperienceGalleryItem = {
  imagePosition?: { x?: number; y?: number };
  imageSrc?: string;
  subtitle: string;
  title: string;
};

type HotelPremiumExperienceGalleryProps = {
  items: ExperienceGalleryItem[];
  locale: HotelLocale;
};

export function HotelPremiumExperienceGallery({ items, locale }: HotelPremiumExperienceGalleryProps) {
  const ui = getHotelUi(locale);

  return (
    <section className="scene hotel-deluxe-section hotel-deluxe-experience" id="experiencia">
      <div className="hotel-deluxe-section-heading hotel-deluxe-experience-heading">
        <span className="scene-chip">{ui.experience.chip}</span>
        <h2>{renderBalancedSectionTitle(ui.experience.title)}</h2>
        <p>{ui.experience.description}</p>
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
