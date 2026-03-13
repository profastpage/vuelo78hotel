import { Coffee, ConciergeBell, Snowflake, Tv, Waves, Wifi } from "lucide-react";

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
    <section className="scene hotel-deluxe-section hotel-deluxe-amenities hotel-home-amenities" id="servicios">
      <div className="hotel-home-amenity-heading">
        <h2>Nuestros Servicios</h2>
      </div>

      <div className="hotel-deluxe-amenity-strip hotel-home-amenity-strip" role="list" aria-label="Servicios del hotel">
        {items.map((item, index) => (
          <article className="hotel-deluxe-amenity-item hotel-home-amenity-item" key={item.title} role="listitem">
            <span className="hotel-deluxe-amenity-icon hotel-home-amenity-icon" aria-hidden="true">
              <AmenityIcon icon={item.icon} index={index} />
            </span>
            <div className="hotel-deluxe-amenity-copy hotel-home-amenity-copy">
              <strong>{item.title}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AmenityIcon({ icon, index }: { icon: string; index: number }) {
  const size = 18;
  const strokeWidth = 1.8;
  const iconId = icon || String(index);

  switch (iconId) {
    case "breakfast":
      return <Coffee size={size} strokeWidth={strokeWidth} />;
    case "wifi":
      return <Wifi size={size} strokeWidth={strokeWidth} />;
    case "pool":
      return <Waves size={size} strokeWidth={strokeWidth} />;
    case "air":
      return <Snowflake size={size} strokeWidth={strokeWidth} />;
    case "tv":
      return <Tv size={size} strokeWidth={strokeWidth} />;
    default:
      return <ConciergeBell size={size} strokeWidth={strokeWidth} />;
  }
}
