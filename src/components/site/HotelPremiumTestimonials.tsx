import { Star } from "lucide-react";
import { renderBalancedSectionTitle } from "./headline-balance";
import type { HotelLocale } from "@/lib/hotel-experience";
import { getHotelUi } from "@/lib/hotel-experience";

type HotelPremiumTestimonial = {
  imagePosition?: { x?: number; y?: number };
  imageSrc?: string;
  name: string;
  quote: string;
  role: string;
  segment?: string;
  rating: number;
};

type HotelPremiumTestimonialsProps = {
  items: HotelPremiumTestimonial[];
  locale: HotelLocale;
  subtitle: string;
  title: string;
};

export function HotelPremiumTestimonials({ items, locale, subtitle, title }: HotelPremiumTestimonialsProps) {
  const ui = getHotelUi(locale);

  return (
    <section className="scene hotel-deluxe-section hotel-deluxe-testimonials hotel-home-testimonials" id="opiniones">
      <div className="hotel-deluxe-section-heading">
        <span className="scene-chip">{ui.testimonials.eyebrow}</span>
        <h2>{renderBalancedSectionTitle(title)}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="hotel-deluxe-testimonial-grid hotel-home-testimonial-grid">
        {items.map((item, index) => (
          <article className="hotel-deluxe-testimonial-card hotel-home-testimonial-card hotel-home-testimonial-card-plain" key={`${item.name}-${index}`}>
            <div
              className={`hotel-home-testimonial-media${item.imageSrc ? " has-media-image" : " media-fallback-hotel"}`}
              style={getTestimonialMediaStyle(item.imageSrc, item.imagePosition)}
            />

            <div className="hotel-home-testimonial-body">
              <div className="hotel-home-testimonial-stars" aria-label={`${item.rating} ${ui.testimonials.starsLabel}`}>
                {Array.from({ length: 5 }, (_, starIndex) => (
                  <span className={starIndex < Math.round(item.rating) ? "is-filled" : ""} key={`${item.name}-${starIndex}`}>
                    <Star fill="currentColor" size={14} strokeWidth={1.7} />
                  </span>
                ))}
              </div>

              <blockquote>{item.quote}</blockquote>
              <footer className="hotel-home-testimonial-footer">
                <strong>{item.name}</strong>
                <p>{item.role}</p>
                <span>{item.segment || ui.testimonials.verifiedGuest}</span>
              </footer>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getTestimonialMediaStyle(imageSrc?: string, position?: { x?: number; y?: number }) {
  const x = typeof position?.x === "number" ? position.x : 50;
  const y = typeof position?.y === "number" ? position.y : 50;

  if (!imageSrc) {
    return undefined;
  }

  return {
    backgroundImage: `url("${imageSrc}")`,
    backgroundPosition: `${x}% ${y}%`,
  };
}
