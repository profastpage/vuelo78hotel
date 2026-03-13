export type EditorSection = "ai" | "hero" | "visual" | "story" | "gallery" | "services" | "testimonials" | "faqs" | "contact" | "booking";

export type EditorTextControls = {
  activeField?: string;
  onFieldFocus?: (fieldKey: string, section: EditorSection, label: string) => void;
  onFieldChange: (fieldKey: string, value: string, section: EditorSection, label: string) => void;
};
