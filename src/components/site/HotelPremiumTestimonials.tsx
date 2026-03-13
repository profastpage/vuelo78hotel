type HotelPremiumTestimonial = {
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

      <div className="hotel-deluxe-testimonial-grid">
        {items.map((item) => (
          <article className="hotel-deluxe-testimonial-card" key={item.name}>
            <div className="hotel-deluxe-testimonial-top">
              <span className="hotel-deluxe-testimonial-avatar" aria-hidden="true">
                {getInitials(item.name)}
              </span>
              <div>
                <strong>{item.name}</strong>
                <p>{item.role}</p>
              </div>
            </div>

            <div className="hotel-deluxe-testimonial-stars" aria-label={`${item.rating} estrellas`}>
              {Array.from({ length: 5 }, (_, index) => (
                <span className={index < Math.round(item.rating) ? "is-filled" : ""} key={`${item.name}-${index}`}>
                  ★
                </span>
              ))}
            </div>

            <blockquote>{item.quote}</blockquote>
            <small>{item.segment || "Reserva directa"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}
