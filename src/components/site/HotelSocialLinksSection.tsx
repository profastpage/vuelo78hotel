"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { HotelLocale } from "@/lib/hotel-experience";

type HotelSocialLinksSectionProps = {
  locale: HotelLocale;
};

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/vuelo78hoteltarapoto",
    iconSrc: "/assets/social/facebook.svg",
    label: "Facebook",
  },
  {
    href: "https://www.instagram.com/vuelo78hotel/",
    iconSrc: "/assets/social/instagram.svg",
    label: "Instagram",
  },
  {
    href: "https://www.tiktok.com/@vuelo78hoteltarapoto",
    iconSrc: "/assets/social/tiktok.svg",
    label: "TikTok",
  },
] as const;

export function HotelSocialLinksSection({ locale }: HotelSocialLinksSectionProps) {
  const ariaPrefix = locale === "en" ? "Visit" : "Visitar";
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.2,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      aria-labelledby="hotel-social-heading"
      className={`scene hotel-social-section${isVisible ? " is-visible" : ""}`}
      ref={sectionRef}
    >
      <div className="hotel-social-shell">
        <h2 className="hotel-social-kicker" id="hotel-social-heading">
          Síguenos
        </h2>
        <span aria-hidden="true" className="hotel-social-divider" />

        <div
          className="hotel-social-links"
          role="list"
          aria-label={locale === "en" ? "Hotel social links" : "Redes sociales del hotel"}
        >
          {SOCIAL_LINKS.map((item) => (
            <a
              aria-label={`${ariaPrefix} ${item.label}`}
              className="hotel-social-link"
              href={item.href}
              key={item.label}
              rel="noreferrer"
              role="listitem"
              target="_blank"
            >
              <span className="hotel-social-icon-frame">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="hotel-social-icon-image"
                  decoding="async"
                  height={64}
                  loading="lazy"
                  sizes="64px"
                  src={item.iconSrc}
                  width={64}
                />
              </span>
              <span className="hotel-social-label">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
