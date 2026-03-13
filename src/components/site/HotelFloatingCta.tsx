"use client";

type HotelFloatingCtaProps = {
  href: string;
  label: string;
  note: string;
};

export function HotelFloatingCta({ href, label, note }: HotelFloatingCtaProps) {
  return (
    <a aria-label={`${label}. ${note}`} className="hotel-reference-mobile-float" href={href}>
      <span className="hotel-reference-mobile-float-word" aria-hidden="true">
        <span>Reservar</span>
        <span>Consultar</span>
      </span>
      <span className="hotel-reference-mobile-float-button">
        <span className="hotel-reference-mobile-float-icon" aria-hidden="true">
          <span />
        </span>
        <span className="hotel-reference-mobile-float-label">Reservar</span>
      </span>
    </a>
  );
}
