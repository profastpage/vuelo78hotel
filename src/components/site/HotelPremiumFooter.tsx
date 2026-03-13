type HotelPremiumFooterProps = {
  address: string;
  brandName: string;
  city?: string;
  email?: string;
  phone?: string;
};

export function HotelPremiumFooter({ address, brandName, city, email, phone }: HotelPremiumFooterProps) {
  return (
    <footer className="hotel-deluxe-footer">
      <div className="hotel-deluxe-footer-brand">
        <strong>{brandName}</strong>
        <p>{city ? `${address}, ${city}` : address}</p>
      </div>
      <div className="hotel-deluxe-footer-contact">
        {phone ? <a href={`tel:${phone.replace(/\D/g, "")}`}>{phone}</a> : null}
        {email ? <a href={`mailto:${email}`}>{email}</a> : null}
      </div>
    </footer>
  );
}
