import type { TimelineItem } from "@/types/site";
import { renderBalancedSectionTitle } from "./headline-balance";

type TimelineSectionProps = {
  title?: string;
  description?: string;
  items: TimelineItem[];
};

export function TimelineSection({ title, description, items }: TimelineSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section
      className="scene scene-timeline"
      id="historia"
      data-animate
      data-editor-section="timeline"
    >
      <div className="section-copy" data-animate>
        <span className="scene-chip">Nuestra historia</span>
        {title ? <h2 className="section-title">{renderBalancedSectionTitle(title)}</h2> : null}
        {description ? <p>{description}</p> : null}
      </div>

      <ol className="timeline-track" role="list">
        {items.map((item, index) => (
          <li
            className="timeline-item"
            key={`${item.year}-${index}`}
            data-animate
            data-animate-delay={String(index * 100)}
          >
            <div className="timeline-marker" aria-hidden="true">
              <span className="timeline-dot" />
            </div>
            <div className="timeline-copy">
              <span className="timeline-year">{item.year}</span>
              <strong>{item.title}</strong>
              {item.description ? <p>{item.description}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
