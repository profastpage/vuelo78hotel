"use client";

import { useId } from "react";
import type { ChangeEvent, ReactNode } from "react";

type InlineImageFieldProps = {
  children: ReactNode;
  enabled?: boolean;
  fieldKey: string;
  label: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  uploading?: boolean;
};

export function InlineImageField({ children, enabled = false, fieldKey, label, onChange, uploading = false }: InlineImageFieldProps) {
  const inputId = useId();

  return (
    <div className={`inline-image-field${enabled ? " is-editable" : ""}${uploading ? " is-uploading" : ""}`} data-field={fieldKey}>
      {children}
      {enabled && onChange ? (
        <label className="inline-image-trigger" htmlFor={inputId}>
          <span>{uploading ? "Subiendo..." : "Adjuntar imagen"}</span>
          <small>{label}</small>
          <input accept="image/*" id={inputId} onChange={onChange} type="file" />
        </label>
      ) : null}
    </div>
  );
}
