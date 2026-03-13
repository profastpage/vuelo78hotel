type HotelPremiumFooterProps = {
  address: string;
  brandName: string;
  city?: string;
  email?: string;
  phone?: string;
};

export function HotelPremiumFooter({ address, brandName, city, email, phone }: HotelPremiumFooterProps) {
  const fastPageMessage = encodeURIComponent(
    "Hola, vi la pagina del Vuelo 78 Hotel y me gustaria informacion para crear una web similar para mi negocio.",
  );
  const fastPageHref = `https://wa.me/51919662011?text=${fastPageMessage}`;

  return (
    <footer className="hotel-deluxe-footer">
      <p className="hotel-deluxe-footer-line">© 2026 {brandName} — Todos los derechos reservados.</p>
      <p className="hotel-deluxe-footer-line">
        Desarrollado por{" "}
        <a href={fastPageHref} target="_blank" rel="noopener noreferrer">
          Fast Page Pro
        </a>
      </p>
    </footer>
  );
}
