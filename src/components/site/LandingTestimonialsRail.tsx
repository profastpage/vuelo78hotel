"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { renderBalancedSectionTitle } from "./headline-balance";
import { InlineImageField } from "./InlineImageField";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { InlineTextField } from "./InlineTextField";
import type { LandingReviewItem } from "./rendering";

type LandingTestimonialsRailProps = {
  reviews: LandingReviewItem[];
  label: string;
  title: string;
  dataAnimateDelay?: number;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorTextControls?: EditorTextControls;
};

export function LandingTestimonialsRail({ reviews, label, title, dataAnimateDelay, editorMode = false, editorImageControls, editorTextControls }: LandingTestimonialsRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
  });

  function scrollRail(direction: "left" | "right") {
    if (!railRef.current) {
      return;
    }

    const width = railRef.current.clientWidth;
    railRef.current.scrollBy({
      left: direction === "left" ? -Math.max(280, width * 0.82) : Math.max(280, width * 0.82),
      behavior: "smooth",
    });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!railRef.current) {
      return;
    }

    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: railRef.current.scrollLeft,
    };

    railRef.current.setPointerCapture(event.pointerId);
    railRef.current.dataset.dragging = "true";
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!railRef.current || !dragStateRef.current.active) {
      return;
    }

    const distance = event.clientX - dragStateRef.current.startX;
    railRef.current.scrollLeft = dragStateRef.current.startScrollLeft - distance;
  }

  function endPointerDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!railRef.current) {
      return;
    }

    if (dragStateRef.current.pointerId >= 0 && railRef.current.hasPointerCapture(dragStateRef.current.pointerId)) {
      railRef.current.releasePointerCapture(dragStateRef.current.pointerId);
    }

    dragStateRef.current.active = false;
    dragStateRef.current.pointerId = -1;
    railRef.current.dataset.dragging = "false";
  }

  return (
    <section
      className="scene scene-testimonials"
      data-editor-section="testimonials"
      id="trabajos"
      data-animate
      data-animate-delay={String(dataAnimateDelay ?? 220)}
    >
      <div className="section-copy testimonials-heading">
        <div>
          {editorMode ? (
            <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.testimonialsChip" label="Chip testimonios" section="testimonials" value={label} />
          ) : (
            <span className="scene-chip">{label}</span>
          )}
          {editorMode ? (
            <InlineTextField
              as="h2"
              className="section-title"
              controls={editorTextControls}
              displayValue={renderBalancedSectionTitle(title)}
              enabled
              fieldKey="uiText.testimonialsTitle"
              label="Titulo testimonios"
              minRows={3}
              multiline
              section="testimonials"
              value={title}
            />
          ) : (
            <h2 className="section-title">{renderBalancedSectionTitle(title)}</h2>
          )}
        </div>
        <div className="testimonial-rail-controls" aria-label="Mover testimonios">
          <button onClick={() => scrollRail("left")} type="button">
            <span aria-hidden="true">{"\u2039"}</span>
          </button>
          <button onClick={() => scrollRail("right")} type="button">
            <span aria-hidden="true">{"\u203A"}</span>
          </button>
        </div>
      </div>

      <div
        className="testimonial-rail"
        onPointerCancel={endPointerDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerDrag}
        ref={railRef}
      >
        {reviews.map((review, index) => (
          <article className="testimonial-card" key={`${review.name}-${index}`}>
            <div className="testimonial-card-head">
              {editorMode ? (
                <InlineImageField
                  enabled={editorMode}
                  fieldKey={`testimonio-${index + 1}`}
                  label={`Testimonio ${index + 1}`}
                  onChange={editorMode ? (event) => editorImageControls?.onTestimonialImageChange(index, event) : undefined}
                  uploading={editorMode && editorImageControls?.uploadingField === `testimonio ${index + 1}`}
                >
                  <div
                    aria-hidden="true"
                    className={`testimonial-avatar ${review.avatarSrc ? "has-media-image" : "is-fallback"}`}
                    style={review.avatarSrc ? { backgroundImage: `url(${review.avatarSrc})` } : undefined}
                  >
                    {!review.avatarSrc ? review.name.slice(0, 1).toUpperCase() : null}
                  </div>
                </InlineImageField>
              ) : (
                <div
                  aria-hidden="true"
                  className={`testimonial-avatar ${review.avatarSrc ? "has-media-image" : "is-fallback"}`}
                  style={review.avatarSrc ? { backgroundImage: `url(${review.avatarSrc})` } : undefined}
                >
                  {!review.avatarSrc ? review.name.slice(0, 1).toUpperCase() : null}
                </div>
              )}
              <div className="testimonial-person">
                {editorMode ? (
                  <InlineTextField as="strong" controls={editorTextControls} enabled fieldKey={`testimonials.${index}.name`} label={`Nombre testimonio ${index + 1}`} section="testimonials" value={review.name} />
                ) : (
                  <strong>{review.name}</strong>
                )}
                {editorMode ? (
                  <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`testimonials.${index}.role`} label={`Rol testimonio ${index + 1}`} section="testimonials" value={review.role} />
                ) : (
                  <span>{review.location || review.role}</span>
                )}
              </div>
            </div>
            {editorMode ? (
              <InlineTextField
                as="p"
                controls={editorTextControls}
                displayValue={`"${review.quote}"`}
                enabled
                fieldKey={`testimonials.${index}.quote`}
                label={`Cita testimonio ${index + 1}`}
                multiline
                minRows={3}
                section="testimonials"
                value={review.quote}
              />
            ) : (
              <p>"{review.quote}"</p>
            )}
            <div className="testimonial-card-foot">
              {editorMode ? (
                <InlineTextField as="span" controls={editorTextControls} enabled fieldKey={`testimonials.${index}.segment`} label={`Segmento testimonio ${index + 1}`} section="testimonials" value={review.segment || review.role} />
              ) : (
                <span>{review.segment || review.role}</span>
              )}
              <div aria-label={`${review.rating} estrellas`} className="testimonial-stars">
                {Array.from({ length: review.rating }).map((_, starIndex) => (
                  <span key={starIndex}>{"\u2605"}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
