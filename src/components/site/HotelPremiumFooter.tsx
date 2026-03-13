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
      <p className="hotel-deluxe-footer-line">
        {"\u00A9"} 2026 {brandName} {"\u00B7"} Todos los derechos reservados.
      </p>
      <p className="hotel-deluxe-footer-line">Desarrollado por Fast Page Pro.</p>
    </footer>
  );
}
