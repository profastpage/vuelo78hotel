"use client";

import { useState } from "react";
import type { SiteContent } from "@/types/site";
import { renderBalancedSectionTitle } from "./headline-balance";
import type { EditorTextControls } from "./editor-text-types";
import { InlineTextField } from "./InlineTextField";

type LandingFaqAccordionProps = {
  items: SiteContent["faqs"];
  label?: string;
  title: string;
  dataAnimateDelay?: number;
  editorMode?: boolean;
  editorTextControls?: EditorTextControls;
};

export function LandingFaqAccordion({ items, label = "Preguntas frecuentes", title, dataAnimateDelay, editorMode = false, editorTextControls }: LandingFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      className="scene scene-landing-faq"
      data-editor-section="faqs"
      data-animate
      data-animate-delay={String(dataAnimateDelay ?? 260)}
    >
      <div className="section-copy">
        {editorMode ? (
          <InlineTextField as="span" className="scene-chip" compact controls={editorTextControls} enabled fieldKey="uiText.faqChip" label="Chip FAQ" section="faqs" value={label} />
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
            fieldKey="uiText.faqTitle"
            label="Titulo FAQ"
            minRows={3}
            multiline
            section="faqs"
            value={title}
          />
        ) : (
          <h2 className="section-title">{renderBalancedSectionTitle(title)}</h2>
        )}
      </div>

      <div className="landing-faq-stack">
        {items.map((faq, index) => (
          <details className="landing-faq-item" key={`${faq.question}-${index}`} open={openIndex === index}>
            <summary
              onClick={(event) => {
                event.preventDefault();
                setOpenIndex((current) => (current === index ? -1 : index));
              }}
            >
              {editorMode ? (
                <InlineTextField
                  as="strong"
                  controls={editorTextControls}
                  enabled
                  fieldKey={`faqs.${index}.question`}
                  label={`Pregunta FAQ ${index + 1}`}
                  multiline
                  minRows={2}
                  section="faqs"
                  showTrigger={false}
                  value={faq.question}
                />
              ) : (
                <strong>{faq.question}</strong>
              )}
              <span aria-hidden="true">{"\u2197"}</span>
            </summary>
            <div>
              {editorMode ? (
                <InlineTextField
                  as="p"
                  controls={editorTextControls}
                  enabled
                  fieldKey={`faqs.${index}.answer`}
                  label={`Respuesta FAQ ${index + 1}`}
                  multiline
                  minRows={3}
                  section="faqs"
                  value={faq.answer}
                />
              ) : (
                <p>{faq.answer}</p>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
