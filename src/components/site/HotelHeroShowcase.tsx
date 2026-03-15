"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState, type CSSProperties } from "react";
import type { ImagePosition } from "@/types/site";

export type HotelHeroSlide = {
  title: string;
  subtitle: string;
  imageSrc: string;
  fallbackSrc?: string;
  imagePosition?: ImagePosition;
  mobileImagePosition?: ImagePosition;
};

type HotelHeroShowcaseProps = {
  slides: HotelHeroSlide[];
};

export function HotelHeroShowcase({ slides }: HotelHeroShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = slides.length;

  const tick = useEffectEvent(() => {
    setActiveIndex((current) => (current + 1) % totalSlides);
  });

  useEffect(() => {
    if (totalSlides < 2) {
      return;
    }

    const intervalId = window.setInterval(() => tick(), 5200);
    return () => window.clearInterval(intervalId);
  }, [tick, totalSlides]);

  return (
    <>
      <div className="hotel-reference-hero-slides" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            className={`hotel-reference-hero-slide${index === activeIndex ? " is-active" : ""}`}
            key={`${slide.imageSrc}-${index}`}
            style={getSlideStyle(slide.imagePosition, slide.mobileImagePosition)}
          >
            <span className="hotel-reference-hero-slide-picture">
              <Image
                alt=""
                className="hotel-reference-hero-slide-media"
                fill
                priority={index === 0}
                quality={95}
                sizes="100vw"
                src={slide.fallbackSrc || slide.imageSrc}
              />
            </span>
          </div>
        ))}
      </div>

      <div className="hotel-reference-hero-thumbs" role="tablist" aria-label="Galeria principal del hotel">
        {slides.map((slide, index) => (
          <button
            aria-label={`Ver imagen ${index + 1}: ${slide.title}`}
            aria-selected={index === activeIndex}
            className={`hotel-reference-hero-thumb${index === activeIndex ? " is-active" : ""}`}
            key={`${slide.title}-${index}`}
            onClick={() => setActiveIndex(index)}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </>
  );
}

function getSlideStyle(position?: ImagePosition, mobilePosition?: ImagePosition) {
  const x = typeof position?.x === "number" ? position.x : 50;
  const y = typeof position?.y === "number" ? position.y : 50;
  const mobileX = typeof mobilePosition?.x === "number" ? mobilePosition.x : x;
  const mobileY = typeof mobilePosition?.y === "number" ? mobilePosition.y : y;

  return {
    ["--hero-image-position" as const]: `${x}% ${y}%`,
    ["--hero-image-position-mobile" as const]: `${mobileX}% ${mobileY}%`,
  } as CSSProperties;
}
