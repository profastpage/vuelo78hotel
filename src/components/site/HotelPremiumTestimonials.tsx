"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef, useState } from "react";
import { renderBalancedSectionTitle } from "./headline-balance";
import type { HotelLocale } from "@/lib/hotel-experience";
import { getHotelUi } from "@/lib/hotel-experience";

type HotelPremiumTestimonial = {
  imageSrc?: string;
  location?: string;
  name: string;
  quote: string;
  role: string;
  segment?: string;
  rating: number;
};

type HotelPremiumTestimonialsProps = {
  items: HotelPremiumTestimonial[];
  locale: HotelLocale;
  subtitle: string;
  title: string;
};

const SWIPE_THRESHOLD = 52;

export function HotelPremiumTestimonials({ items, locale, subtitle, title }: HotelPremiumTestimonialsProps) {
  const ui = getHotelUi(locale);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  if (!items.length) {
    return null;
  }

  const goTo = (index: number) => {
    const total = items.length;
    setActiveIndex(((index % total) + total) % total);
  };

  const goPrevious = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  return (
    <section className="scene hotel-deluxe-section hotel-deluxe-testimonials hotel-home-testimonials" id="opiniones">
      <div className="hotel-deluxe-section-heading hotel-home-testimonial-heading">
        <span className="scene-chip">{ui.testimonials.eyebrow}</span>
        <h2>{renderBalancedSectionTitle(title)}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="hotel-home-testimonial-carousel-shell">
        <div className="hotel-home-testimonial-carousel-head">
          <div className="hotel-home-testimonial-carousel-meta">
            <strong>
              {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </strong>
            <span>{locale === "en" ? "Real stays and memorable moments" : "Estadias reales y momentos memorables"}</span>
          </div>

          <div className="hotel-home-testimonial-carousel-controls" aria-label={ui.testimonials.eyebrow}>
            <button
              aria-label={locale === "en" ? "Previous testimonial" : "Testimonio anterior"}
              className="hotel-home-testimonial-carousel-button"
              onClick={goPrevious}
              type="button"
            >
              <ChevronLeft size={18} strokeWidth={2.1} />
            </button>
            <button
              aria-label={locale === "en" ? "Next testimonial" : "Siguiente testimonio"}
              className="hotel-home-testimonial-carousel-button"
              onClick={goNext}
              type="button"
            >
              <ChevronRight size={18} strokeWidth={2.1} />
            </button>
          </div>
        </div>

        <div
          aria-label={locale === "en" ? "Guest testimonials" : "Testimonios de huespedes"}
          aria-roledescription="carousel"
          className="hotel-home-testimonial-carousel-viewport"
          onTouchEnd={(event) => {
            const startX = touchStartXRef.current;
            if (startX === null) {
              return;
            }

            const deltaX = event.changedTouches[0]?.clientX - startX;
            touchStartXRef.current = null;

            if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
              return;
            }

            if (deltaX < 0) {
              goNext();
              return;
            }

            goPrevious();
          }}
          onTouchStart={(event) => {
            touchStartXRef.current = event.touches[0]?.clientX ?? null;
          }}
        >
          <div className="hotel-home-testimonial-carousel-track" style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}>
            {items.map((item, index) => (
              <article className="hotel-home-testimonial-slide" key={`${item.name}-${index}`}>
                <div className="hotel-home-testimonial-media-panel">
                  {item.imageSrc ? (
                    <Image
                      alt={`${item.name} en Vuelo 78 Hotel`}
                      className="hotel-home-testimonial-image"
                      fill
                      priority={index === 0}
                      sizes="(max-width: 860px) 100vw, 54vw"
                      src={item.imageSrc}
                    />
                  ) : (
                    <div aria-hidden="true" className="hotel-home-testimonial-media-fallback" />
                  )}

                  <div className="hotel-home-testimonial-media-overlay" aria-hidden="true" />

                  {item.location ? (
                    <div className="hotel-home-testimonial-media-badge">
                      <span>{item.location}</span>
                    </div>
                  ) : null}
                </div>

                <div className="hotel-home-testimonial-content">
                  <div className="hotel-home-testimonial-stars" aria-label={`${item.rating} ${ui.testimonials.starsLabel}`}>
                    {Array.from({ length: 5 }, (_, starIndex) => (
                      <span className={starIndex < Math.round(item.rating) ? "is-filled" : ""} key={`${item.name}-${starIndex}`}>
                        <Star fill="currentColor" size={16} strokeWidth={1.8} />
                      </span>
                    ))}
                  </div>

                  <blockquote>{item.quote}</blockquote>

                  <footer className="hotel-home-testimonial-footer">
                    <div className="hotel-home-testimonial-person">
                      <strong>{item.name}</strong>
                      <p>{item.role}</p>
                    </div>
                    <span>{item.segment || ui.testimonials.verifiedGuest}</span>
                  </footer>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hotel-home-testimonial-dots" role="tablist" aria-label={locale === "en" ? "Testimonial navigation" : "Navegacion de testimonios"}>
          {items.map((item, index) => (
            <button
              aria-label={`${locale === "en" ? "View testimonial" : "Ver testimonio"} ${index + 1}: ${item.name}`}
              aria-selected={index === activeIndex}
              className={index === activeIndex ? "is-active" : undefined}
              key={`${item.name}-dot`}
              onClick={() => goTo(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
