"use client";

type HotelFloatingCtaProps = {
  href: string;
  label: string;
  note: string;
};

export function HotelFloatingCta({ href, label, note }: HotelFloatingCtaProps) {
  return (
    <a className="hotel-reference-mobile-float" href={href}>
      <span className="hotel-reference-mobile-float-icon" aria-hidden="true">
        <span />
      </span>
      <span className="hotel-reference-mobile-float-copy">
        <strong>{label}</strong>
        <small>{note}</small>
      </span>
    </a>
  );
}
