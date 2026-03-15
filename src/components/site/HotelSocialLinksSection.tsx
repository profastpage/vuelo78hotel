import { Facebook, Instagram, Music2 } from "lucide-react";
import type { HotelLocale } from "@/lib/hotel-experience";

type HotelSocialLinksSectionProps = {
  locale: HotelLocale;
};

const SOCIAL_LINKS = [
  {
    emoji: "📘",
    href: "https://www.facebook.com/vuelo78hoteltarapoto",
    icon: Facebook,
    label: "Facebook",
  },
  {
    emoji: "📸",
    href: "https://www.instagram.com/vuelo78hotel/",
    icon: Instagram,
    label: "Instagram",
  },
  {
    emoji: "🎵",
    href: "https://www.tiktok.com/@vuelo78hoteltarapoto",
    icon: Music2,
    label: "TikTok",
  },
] as const;

export function HotelSocialLinksSection({ locale }: HotelSocialLinksSectionProps) {
  const ariaPrefix = locale === "en" ? "Visit" : "Visitar";

  return (
    <section className="scene hotel-social-section" data-animate data-animate-delay="120" aria-labelledby="hotel-social-heading">
      <div className="hotel-social-shell">
        <span className="hotel-social-kicker" id="hotel-social-heading">
          Síguenos
        </span>

        <div className="hotel-social-links" role="list" aria-label={locale === "en" ? "Hotel social links" : "Redes sociales del hotel"}>
          {SOCIAL_LINKS.map((item) => {
            const Icon = item.icon;

            return (
              <a
                className="hotel-social-link"
                href={item.href}
                key={item.label}
                rel="noreferrer"
                role="listitem"
                target="_blank"
                aria-label={`${ariaPrefix} ${item.label}`}
              >
                <span aria-hidden="true" className="hotel-social-emoji">
                  {item.emoji}
                </span>
                <Icon aria-hidden="true" className="hotel-social-icon" strokeWidth={1.8} />
                <span className="hotel-social-label">{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
