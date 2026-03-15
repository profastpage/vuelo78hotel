import { HotelBrandLogo } from "./HotelBrandLogo";

type HotelPremiumFooterProps = {
  address: string;
  brandName: string;
  city?: string;
  email?: string;
  phone?: string;
};

export function HotelPremiumFooter({ address, brandName, city, email, phone }: HotelPremiumFooterProps) {
  void address;
  void city;
  void email;
  void phone;

  const fastPageMessage = encodeURIComponent(
    "👋 Hola, vi que ustedes desarrollaron la web del Vuelo 78 Hotel.\n\nQuisiera una página similar para mi negocio.",
  );
  const fastPageHref = `https://wa.me/51919662011?text=${fastPageMessage}`;

  return (
    <footer className="hotel-deluxe-footer">
      <a className="hotel-deluxe-footer-logo-link" href="/" aria-label={`Ir al inicio de ${brandName}`}>
        <HotelBrandLogo className="hotel-deluxe-footer-logo" sizes="(max-width: 860px) 170px, 200px" width={200} />
      </a>
      <div className="hotel-deluxe-footer-copy">
        <p className="hotel-deluxe-footer-line">{"\u00A9"} 2026 Vuelo 78 Hotel. Todos los derechos reservados.</p>
        <p className="hotel-deluxe-footer-line">
          Diseño y desarrollo web por{" "}
          <a href={fastPageHref} target="_blank" rel="noopener noreferrer">
            Fast Page Pro
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
