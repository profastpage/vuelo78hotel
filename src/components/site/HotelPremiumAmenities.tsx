import { Coffee, ConciergeBell, Snowflake, Tv, Waves, Wifi } from "lucide-react";
import { renderBalancedSectionTitle } from "./headline-balance";
import type { HotelLocale } from "@/lib/hotel-experience";
import { getHotelUi } from "@/lib/hotel-experience";

type HotelPremiumAmenity = {
  description: string;
  icon: string;
  title: string;
};

type HotelPremiumAmenitiesProps = {
  items: HotelPremiumAmenity[];
  locale: HotelLocale;
};

export function HotelPremiumAmenities({ items, locale }: HotelPremiumAmenitiesProps) {
  const ui = getHotelUi(locale);

  return (
    <section className="scene hotel-deluxe-section hotel-deluxe-amenities hotel-home-amenities" id="servicios">
      <div className="hotel-home-amenity-heading">
        <h2>{renderBalancedSectionTitle(ui.amenities.title)}</h2>
      </div>

      <div className="hotel-deluxe-amenity-strip hotel-home-amenity-strip" role="list" aria-label={ui.amenities.listAria}>
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
