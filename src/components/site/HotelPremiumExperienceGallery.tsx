"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderBalancedSectionTitle } from "./headline-balance";
import { getHotelUi, type HotelLocale } from "@/lib/hotel-experience";
import type { HotelExperienceGalleryItem } from "@/lib/hotel-experience-gallery";

type HotelPremiumExperienceGalleryProps = {
  items: HotelExperienceGalleryItem[];
  locale: HotelLocale;
};

type ExperienceGroup = {
  areaKey: HotelExperienceGalleryItem["areaKey"];
  areaLabel: string;
  items: HotelExperienceGalleryItem[];
};

const DRAG_THRESHOLD_MIN = 40;
const DRAG_THRESHOLD_MAX = 110;

export function HotelPremiumExperienceGallery({ items, locale }: HotelPremiumExperienceGalleryProps) {
  const ui = getHotelUi(locale);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragDeltaXRef = useRef(0);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const labels = useMemo(
    () => ({
      next: locale === "en" ? "Next photo" : "Foto siguiente",
      photos: locale === "en" ? "photos" : "fotos",
      previous: locale === "en" ? "Previous photo" : "Foto anterior",
    }),
    [locale],
  );

  const groups = useMemo<ExperienceGroup[]>(() => {
    const map = new Map<HotelExperienceGalleryItem["areaKey"], ExperienceGroup>();

    for (const item of items) {
      const existing = map.get(item.areaKey);
      if (existing) {
        existing.items.push(item);
        continue;
      }

      map.set(item.areaKey, {
        areaKey: item.areaKey,
        areaLabel: item.areaLabel,
        items: [item],
      });
    }

    return Array.from(map.values());
  }, [items]);

  const currentGroup = groups[activeGroupIndex] ?? groups[0];
  const currentItems = currentGroup?.items ?? [];
  const slideCount = currentItems.length;

  const loopedItems = useMemo(() => {
    if (slideCount <= 1) {
      return currentItems;
    }

    return [...currentItems, ...currentItems, ...currentItems];
  }, [currentItems, slideCount]);

  const normalizedIndex = slideCount > 0 ? ((activeIndex % slideCount) + slideCount) % slideCount : 0;

  const visibleIndexes = useMemo(() => {
    const indexes = new Set<number>();
    const before = 3;
    const after = 3;

    for (let index = activeIndex - before; index <= activeIndex + after; index += 1) {
      if (index >= 0 && index < loopedItems.length) {
        indexes.add(index);
      }
    }

    return indexes;
  }, [activeIndex, loopedItems.length]);

  useEffect(() => {
    setActiveIndex(slideCount > 1 ? slideCount : 0);
    setDragOffset(0);
    setTransitionEnabled(true);
  }, [slideCount, activeGroupIndex]);

  useEffect(() => {
    const updateStep = () => {
      const track = trackRef.current;
      if (!track) {
        return;
      }

      const slides = track.querySelectorAll<HTMLElement>("[data-experience-slide]");
      if (!slides.length) {
        return;
      }

      if (slides.length > 1) {
        setStep(slides[1].offsetLeft - slides[0].offsetLeft);
        return;
      }

      setStep(slides[0].offsetWidth);
    };

    updateStep();

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateStep);
    if (observer && trackRef.current) {
      observer.observe(trackRef.current);
    }

    window.addEventListener("resize", updateStep);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateStep);
    };
  }, [loopedItems.length]);

  const goTo = (index: number) => {
    if (slideCount <= 1) {
      return;
    }

    setTransitionEnabled(true);
    setActiveIndex(index);
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrevious = () => goTo(activeIndex - 1);

  const resetToLoopWindow = (index: number) => {
    setTransitionEnabled(false);
    setActiveIndex(index);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setTransitionEnabled(true));
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    dragPointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragDeltaXRef.current = 0;
    setTransitionEnabled(false);
    setDragOffset(0);
    setIsDragging(true);
    viewportRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragStartXRef.current;
    dragDeltaXRef.current = deltaX;
    setDragOffset(deltaX);
  };

  const releasePointer = (pointerId: number) => {
    if (dragPointerIdRef.current !== pointerId) {
      return;
    }

    const threshold = step > 0 ? Math.min(Math.max(step * 0.18, DRAG_THRESHOLD_MIN), DRAG_THRESHOLD_MAX) : 72;
    const deltaX = dragDeltaXRef.current;

    dragPointerIdRef.current = null;
    dragDeltaXRef.current = 0;
    setIsDragging(false);
    setTransitionEnabled(true);
    setDragOffset(0);

    if (Math.abs(deltaX) >= threshold) {
      setActiveIndex((current) => current + (deltaX < 0 ? 1 : -1));
    }
  };

  if (!groups.length || !currentGroup) {
    return null;
  }

  return (
    <section className="scene hotel-deluxe-section hotel-deluxe-experience" id="experiencia">
      <div className="hotel-deluxe-section-heading hotel-deluxe-experience-heading">
        <span className="scene-chip">{ui.experience.chip}</span>
        <h2>{renderBalancedSectionTitle(ui.experience.title)}</h2>
        <p>{ui.experience.description}</p>
      </div>

      <div className="hotel-experience-carousel-shell">
        <div className="hotel-experience-carousel-tabs" role="tablist">
          {groups.map((group, index) => (
            <button
              aria-selected={index === activeGroupIndex}
              className={index === activeGroupIndex ? "is-active" : undefined}
              key={group.areaKey}
              onClick={() => setActiveGroupIndex(index)}
              role="tab"
              type="button"
            >
              {group.areaLabel}
            </button>
          ))}
        </div>

        <div className="hotel-experience-carousel-toolbar">
          <div className="hotel-experience-carousel-meta">
            <strong>{currentGroup.areaLabel}</strong>
            <span>
              {currentItems.length} {labels.photos}
            </span>
          </div>

          {slideCount > 1 ? (
            <div className="hotel-experience-carousel-controls">
              <button
                aria-label={`${labels.previous}: ${currentGroup.areaLabel}`}
                className="hotel-experience-carousel-button"
                onClick={goPrevious}
                type="button"
              >
                <span aria-hidden="true">&lt;</span>
              </button>
              <button
                aria-label={`${labels.next}: ${currentGroup.areaLabel}`}
                className="hotel-experience-carousel-button"
                onClick={goNext}
                type="button"
              >
                <span aria-hidden="true">&gt;</span>
              </button>
            </div>
          ) : null}
        </div>

        <div
          aria-label={currentGroup.areaLabel}
          aria-roledescription="carousel"
          className={`hotel-experience-carousel-viewport${step > 0 ? " is-ready" : ""}${isDragging ? " is-dragging" : ""}`}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              goPrevious();
            }

            if (event.key === "ArrowRight") {
              event.preventDefault();
              goNext();
            }
          }}
          onPointerCancel={(event) => releasePointer(event.pointerId)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(event) => releasePointer(event.pointerId)}
          ref={viewportRef}
          role="region"
          tabIndex={0}
        >
          <div
            className="hotel-experience-carousel-track"
            onTransitionEnd={() => {
              if (!transitionEnabled || slideCount <= 1) {
                return;
              }

              if (activeIndex < slideCount) {
                resetToLoopWindow(activeIndex + slideCount);
                return;
              }

              if (activeIndex >= slideCount * 2) {
                resetToLoopWindow(activeIndex - slideCount);
              }
            }}
            ref={trackRef}
            style={{
              transform: `translate3d(${step > 0 ? (-activeIndex * step) + dragOffset : 0}px, 0, 0)`,
              transition: transitionEnabled ? "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
            }}
          >
            {loopedItems.map((item, index) => {
              const itemIndex = slideCount > 0 ? ((index % slideCount) + slideCount) % slideCount : 0;
              const isCover = itemIndex === 0;

              return (
                <figure className="hotel-experience-carousel-slide" data-experience-slide key={`${currentGroup.areaKey}-${item.id}-${index}`}>
                  <div className="hotel-experience-carousel-media">
                    {visibleIndexes.has(index) ? (
                      <Image
                        alt={item.alt}
                        className="hotel-experience-carousel-image"
                        draggable={false}
                        fill
                        loading={index >= slideCount && index < slideCount + 2 ? "eager" : "lazy"}
                        sizes="(max-width: 640px) calc(100vw - 52px), (max-width: 960px) 72vw, (max-width: 1280px) 42vw, 34vw"
                        src={item.src}
                      />
                    ) : (
                      <div aria-hidden="true" className="hotel-experience-carousel-skeleton" />
                    )}
                  </div>

                  {isCover ? (
                    <figcaption className="hotel-experience-carousel-cover">
                      <span>{currentGroup.areaLabel}</span>
                      <strong>{item.title}</strong>
                    </figcaption>
                  ) : null}
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
