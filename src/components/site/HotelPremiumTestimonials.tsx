import { MapPin, Quote, Star } from "lucide-react";

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
  subtitle: string;
  title: string;
};

export function HotelPremiumTestimonials({ items, subtitle, title }: HotelPremiumTestimonialsProps) {
  return (
    <section className="scene hotel-deluxe-section hotel-deluxe-testimonials" id="opiniones">
      <div className="hotel-deluxe-section-heading">
        <span className="scene-chip">Opiniones reales</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="hotel-deluxe-testimonial-grid hotel-deluxe-testimonial-grid-premium">
        {items.map((item, index) => (
          <article className="hotel-deluxe-testimonial-card hotel-deluxe-testimonial-card-premium" key={`${item.name}-${index}`}>
            <div
              className={`hotel-deluxe-testimonial-media${item.imageSrc ? " has-media-image" : " media-fallback-hotel"}`}
              style={getTestimonialMediaStyle(item.imageSrc, item.imagePosition)}
            />
            <div className="hotel-deluxe-testimonial-overlay" aria-hidden="true" />

            <div className="hotel-deluxe-testimonial-topline">
              <span className="hotel-deluxe-testimonial-segment">
                <MapPin size={14} strokeWidth={1.8} />
                {item.segment || "Huesped verificado"}
              </span>
              <div className="hotel-deluxe-testimonial-stars" aria-label={`${item.rating} estrellas`}>
                {Array.from({ length: 5 }, (_, starIndex) => (
                  <span className={starIndex < Math.round(item.rating) ? "is-filled" : ""} key={`${item.name}-${starIndex}`}>
                    <Star fill="currentColor" size={14} strokeWidth={1.7} />
                  </span>
                ))}
              </div>
            </div>

            <div className="hotel-deluxe-testimonial-body">
              <span className="hotel-deluxe-testimonial-quote-mark" aria-hidden="true">
                <Quote size={22} strokeWidth={1.8} />
              </span>
              <blockquote>{item.quote}</blockquote>
              <footer>
                <strong>{item.name}</strong>
                <p>{item.role}</p>
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
