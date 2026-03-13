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
        <h2>Servicios pensados para una estancia comoda y sin complicaciones.</h2>
        <p>Todo lo necesario para descansar bien y moverte con facilidad durante tu viaje.</p>
      </div>

      <div className="hotel-deluxe-amenity-grid">
        {items.map((item) => (
          <article className="hotel-deluxe-amenity-card" key={item.title}>
            <span className="hotel-deluxe-amenity-icon" aria-hidden="true">
              {item.icon}
            </span>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
