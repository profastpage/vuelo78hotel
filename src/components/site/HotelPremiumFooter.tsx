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

  return (
    <footer className="hotel-deluxe-footer">
      <a className="hotel-deluxe-footer-logo-link" href="/" aria-label={`Ir al inicio de ${brandName}`}>
        <HotelBrandLogo className="hotel-deluxe-footer-logo" sizes="(max-width: 860px) 170px, 200px" width={200} />
      </a>
      <div className="hotel-deluxe-footer-copy">
        <p className="hotel-deluxe-footer-line">
          {"\u00A9"} 2026 {brandName} {"\u00B7"} Todos los derechos reservados.
        </p>
        <p className="hotel-deluxe-footer-line">Desarrollado por Fast Page Pro.</p>
      </div>
    </footer>
  );
}
