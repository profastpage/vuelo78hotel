"use client";

import type { ReactNode } from "react";

type EditorRemovableProps = {
  children: ReactNode;
  editorMode?: boolean;
  label: string;
  onRemove?: () => void;
};

export function EditorRemovable({ children, editorMode = false, label, onRemove }: EditorRemovableProps) {
  return (
    <div className={`editor-removable${editorMode ? " is-editor" : ""}`}>
      {editorMode && onRemove ? (
        <button
          aria-label={`Eliminar ${label}`}
          className="editor-remove-button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove();
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          type="button"
        >
          X
        </button>
      ) : null}
      {children}
    </div>
  );
}
