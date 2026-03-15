import Image from "next/image";

const LOGO_WIDTH = 128;
const LOGO_HEIGHT = 62;

type HotelBrandLogoProps = {
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
};

export function HotelBrandLogo({
  className,
  priority = false,
  sizes = "(max-width: 860px) 108px, 128px",
  width = LOGO_WIDTH,
}: HotelBrandLogoProps) {
  const height = Math.round((width * LOGO_HEIGHT) / LOGO_WIDTH);

  return (
    <Image
      alt="Vuelo 78 Hotel"
      className={className}
      height={height}
      priority={priority}
      sizes={sizes}
      src="/assets/branding/logo-vuelo78.png"
      width={width}
    />
  );
}
