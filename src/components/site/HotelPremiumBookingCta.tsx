import { renderBalancedSectionTitle } from "./headline-balance";
import type { HotelLocale } from "@/lib/hotel-experience";
import { getHotelUi } from "@/lib/hotel-experience";

type HotelPremiumBookingCtaProps = {
  description: string;
  href: string;
  locale: HotelLocale;
  title: string;
};

export function HotelPremiumBookingCta({ description, href, locale, title }: HotelPremiumBookingCtaProps) {
  const ui = getHotelUi(locale);

  return (
    <section className="scene hotel-deluxe-section hotel-deluxe-booking-cta" id="cta-final">
      <div className="hotel-deluxe-booking-cta-shell">
        <span className="scene-chip">{ui.bookingCta.chip}</span>
        <h2>{renderBalancedSectionTitle(title)}</h2>
        <p>{description}</p>
        <a className="primary-button hotel-deluxe-whatsapp-button hotel-deluxe-booking-cta-button" href={href}>
          {ui.bookingCta.button}
        </a>
      </div>
    </section>
  );
}
