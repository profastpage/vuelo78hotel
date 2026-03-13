"use client";

import { useState } from "react";
import type { SiteContent } from "@/types/site";
import { EditorRemovable } from "./EditorRemovable";
import type { EditorTextControls } from "./editor-text-types";
import { InlineTextField } from "./InlineTextField";

type FaqAccordionListProps = {
  items: SiteContent["faqs"];
  className?: string;
  dataEditorSection?: string;
  editorMode?: boolean;
  onRemoveItem?: (index: number) => void;
  editorTextControls?: EditorTextControls;
};

export function FaqAccordionList({ items, className, dataEditorSection, editorMode = false, onRemoveItem, editorTextControls }: FaqAccordionListProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className={`faq-accordion${className ? ` ${className}` : ""}`} data-editor-section={dataEditorSection}>
      {items.map((faq, index) => (
        <EditorRemovable editorMode={editorMode} key={`${faq.question}-${index}`} label={`faq ${index + 1}`} onRemove={onRemoveItem ? () => onRemoveItem(index) : undefined}>
          <details className="faq-accordion-item" open={openIndex === index}>
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
              <span aria-hidden="true">{openIndex === index ? "\u2198" : "\u2197"}</span>
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
        </EditorRemovable>
      ))}
    </div>
  );
}
