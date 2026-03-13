type HotelPremiumTestimonial = {
  avatarSrc?: string;
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
        {items.map((item, index) => (
          <article className="hotel-deluxe-testimonial-card" key={item.name}>
            <div className="hotel-deluxe-testimonial-top">
              <span className="hotel-deluxe-testimonial-avatar" aria-hidden="true">
                <img alt="" src={item.avatarSrc || getPortraitDataUri(item.name, index)} />
              </span>
              <div>
                <strong>{item.name}</strong>
                <p>{item.role}</p>
              </div>
            </div>

            <div className="hotel-deluxe-testimonial-stars" aria-label={`${item.rating} estrellas`}>
              {Array.from({ length: 5 }, (_, starIndex) => (
                <span className={starIndex < Math.round(item.rating) ? "is-filled" : ""} key={`${item.name}-${starIndex}`}>
                  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m10 2.4 2.28 4.62 5.1.74-3.69 3.6.87 5.08L10 14.04 5.44 16.44l.87-5.08-3.69-3.6 5.1-.74L10 2.4Z" />
                  </svg>
                </span>
              ))}
            </div>

            <blockquote>{item.quote}</blockquote>
            <small>{item.segment || "Huesped verificado"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function getPortraitDataUri(name: string, index: number) {
  const palettes = [
    ["#e6d3b0", "#c9a44f", "#173f7b"],
    ["#d7e1ef", "#6c8fc3", "#173f7b"],
    ["#ecd6cf", "#c98f7a", "#173f7b"],
  ];
  const [base, accent, deep] = palettes[index % palettes.length];
  const label = encodeURIComponent(name.split(" ")[0] || "Huesped");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${base}"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="url(#bg)"/>
      <circle cx="60" cy="44" r="20" fill="#f7efe3"/>
      <path d="M30 104c4-19 18-31 30-31s26 12 30 31" fill="#f7efe3"/>
      <path d="M40 36c2-12 14-20 23-20 11 0 21 6 23 18-7-5-14-7-24-7-9 0-15 2-22 9Z" fill="${deep}" opacity="0.88"/>
      <text x="60" y="112" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="${deep}" opacity="0.76">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
