"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { HotelLocale } from "@/lib/hotel-experience";
import type { HotelRoomGallerySlide } from "@/lib/hotel-room-gallery";

type HotelRoomGalleryCarouselProps = {
  locale: HotelLocale;
  roomTitle: string;
  slides: HotelRoomGallerySlide[];
};

export function HotelRoomGalleryCarousel({ locale, roomTitle, slides }: HotelRoomGalleryCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const slideCount = slides.length;

  const labels = useMemo(
    () => ({
      counter: locale === "en" ? "selected views" : "vistas seleccionadas",
      next: locale === "en" ? "Next image" : "Imagen siguiente",
      previous: locale === "en" ? "Previous image" : "Imagen anterior",
      roles: {
        alternate: locale === "en" ? "Alternate angle" : "Otra perspectiva",
        bath: locale === "en" ? "Bathroom" : "Bano",
        detail: locale === "en" ? "Detail" : "Detalle",
        general: locale === "en" ? "Wide view" : "Vista general",
        main: locale === "en" ? "Main bed" : "Area principal",
      },
    }),
    [locale],
  );

  const visibleIndexes = useMemo(() => {
    const indexes = new Set<number>();
    indexes.add(activeIndex);

    if (slideCount > 1) {
      indexes.add((activeIndex + 1) % slideCount);
      indexes.add((activeIndex - 1 + slideCount) % slideCount);
    }

    return indexes;
  }, [activeIndex, slideCount]);

  const goTo = (index: number) => {
    setActiveIndex((index + slideCount) % slideCount);
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrevious = () => goTo(activeIndex - 1);

  const handleTouchEnd = () => {
    if (touchStartX === null || touchCurrentX === null) {
      setTouchStartX(null);
      setTouchCurrentX(null);
      return;
    }

    const delta = touchCurrentX - touchStartX;
    if (Math.abs(delta) > 42) {
      if (delta < 0) {
        goNext();
      } else {
        goPrevious();
      }
    }

    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  return (
    <div className="hotel-room-carousel">
      <div className="hotel-room-carousel-head">
        <p>
          <strong>{slideCount}</strong> {labels.counter}
        </p>
        {slideCount > 1 ? (
          <div className="hotel-room-carousel-controls">
            <button
              aria-label={`${labels.previous}: ${roomTitle}`}
              className="hotel-room-carousel-button"
              onClick={goPrevious}
              type="button"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              aria-label={`${labels.next}: ${roomTitle}`}
              className="hotel-room-carousel-button"
              onClick={goNext}
              type="button"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : null}
      </div>

      <div
        className="hotel-room-carousel-viewport"
        onTouchEnd={handleTouchEnd}
        onTouchMove={(event) => setTouchCurrentX(event.changedTouches[0]?.clientX ?? null)}
        onTouchStart={(event) => {
          const clientX = event.changedTouches[0]?.clientX ?? null;
          setTouchStartX(clientX);
          setTouchCurrentX(clientX);
        }}
      >
        <div className="hotel-room-carousel-track" style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}>
          {slides.map((slide, index) => (
            <figure className="hotel-room-carousel-slide" key={slide.id}>
              <div className="hotel-room-carousel-media">
                {visibleIndexes.has(index) ? (
                  <Image
                    alt={slide.alt}
                    className="hotel-room-carousel-image"
                    draggable={false}
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 92vw, (max-width: 860px) 94vw, 58vw"
                    src={slide.webpSrc}
                  />
                ) : (
                  <div aria-hidden="true" className="hotel-room-carousel-skeleton" />
                )}
              </div>
              <figcaption>{labels.roles[slide.role]}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {slideCount > 1 ? (
        <div aria-label={roomTitle} className="hotel-room-carousel-dots" role="tablist">
          {slides.map((slide, index) => (
            <button
              aria-label={`${roomTitle}: ${index + 1}`}
              aria-selected={index === activeIndex}
              className={index === activeIndex ? "is-active" : undefined}
              key={slide.id}
              onClick={() => goTo(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
