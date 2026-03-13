"use client";

import { createElement, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { KeyboardEvent } from "react";
import type { EditorSection, EditorTextControls } from "./editor-text-types";

type InlineTextFieldProps = {
  as?: "span" | "p" | "strong" | "h1" | "h2" | "h3";
  className?: string;
  compact?: boolean;
  controls?: EditorTextControls;
  enabled?: boolean;
  fieldKey: string;
  label: string;
  minRows?: number;
  multiline?: boolean;
  section: EditorSection;
  showTrigger?: boolean;
  value: string;
  displayValue?: ReactNode;
};

function normalizeDraft(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

export function InlineTextField({
  as = "p",
  className,
  compact = false,
  controls,
  enabled = false,
  fieldKey,
  label,
  minRows = 3,
  multiline = false,
  section,
  showTrigger = true,
  value,
  displayValue,
}: InlineTextFieldProps) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function focusField() {
    controls?.onFieldFocus?.(fieldKey, section, label);
  }

  function startEditing() {
    focusField();
    setEditing(true);
  }

  function commitDraft() {
    const nextValue = normalizeDraft(draft);
    if (!nextValue) {
      setDraft(value);
      setEditing(false);
      return;
    }

    if (nextValue !== value) {
      controls?.onFieldChange(fieldKey, nextValue, section, label);
    }

    setEditing(false);
  }

  function resetDraft() {
    setDraft(value);
    setEditing(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      resetDraft();
      return;
    }

    if (!multiline && event.key === "Enter") {
      event.preventDefault();
      commitDraft();
    }
  }

  if (!enabled || !controls) {
    return createElement(as, { className }, displayValue ?? value);
  }

  return (
    <div className={`inline-text-shell${compact ? " compact" : ""}${editing ? " is-editing" : ""}${controls.activeField === fieldKey ? " is-active" : ""}`}>
      {editing ? (
        <div className="inline-text-editor">
          {multiline ? (
            <textarea
              autoFocus
              className="inline-text-input"
              onBlur={commitDraft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              rows={minRows}
              value={draft}
            />
          ) : (
            <input
              autoFocus
              className="inline-text-input"
              onBlur={commitDraft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              type="text"
              value={draft}
            />
          )}
        </div>
      ) : (
        createElement(
          as,
          {
            className,
            onClick: startEditing,
            tabIndex: 0,
            onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                startEditing();
              }
            },
          },
          displayValue ?? value,
        )
      )}

      {!editing && showTrigger ? (
        <button
          className="inline-text-trigger"
          onClick={startEditing}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          Editar texto
        </button>
      ) : null}
    </div>
  );
}
