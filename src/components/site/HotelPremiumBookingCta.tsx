type HotelPremiumBookingCtaProps = {
  description: string;
  href: string;
  title: string;
};

export function HotelPremiumBookingCta({ description, href, title }: HotelPremiumBookingCtaProps) {
  return (
    <section className="scene hotel-deluxe-section hotel-deluxe-booking-cta" id="cta-final">
      <div className="hotel-deluxe-booking-cta-shell">
        <span className="scene-chip">Reserva directa</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <a className="primary-button hotel-deluxe-whatsapp-button hotel-deluxe-booking-cta-button" href={href}>
          Reservar por WhatsApp
        </a>
      </div>
    </section>
  );
}
