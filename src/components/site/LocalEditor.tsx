"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { BOOKING_WIDGET_PRESET_OPTIONS, buildBookingWidgetFromPreset, detectBookingWidgetPreset, resolveBookingWidget } from "@/lib/booking-widget";
import { HOTEL_NAV_ITEMS, type HotelPageSlug } from "@/lib/hotel-pages";
import type { ClientProfile, ReferenceSnapshot, SiteContent } from "@/types/site";
import { SiteRenderer } from "./SiteRenderer";
import type { EditorCollectionKey } from "./editor-item-types";
import type { EditorSection, EditorTextControls } from "./editor-text-types";
import { getStoryLabels, LAYOUT_MODE_OPTIONS, SHELL_MODE_OPTIONS, VISUAL_STYLE_OPTIONS } from "./rendering";

type LocalEditorProps = {
  profile: ClientProfile;
  content: SiteContent;
  rawInput: string;
  referenceSnapshot?: ReferenceSnapshot | null;
};

type EditorViewport = "desktop" | "tablet" | "mobile";

type EditorState = {
  brand: SiteContent["brand"];
  narrative: SiteContent["narrative"];
  stats: SiteContent["stats"];
  theme: SiteContent["theme"];
  uiText: NonNullable<SiteContent["uiText"]>;
  visibility: NonNullable<SiteContent["visibility"]>;
  contact: SiteContent["contact"];
  location: NonNullable<SiteContent["location"]>;
  bookingWidget: NonNullable<SiteContent["bookingWidget"]>;
  pages: string[];
  highlights: string[];
  galleryItems: Array<{
    title: string;
    subtitle: string;
    imageSrc?: string;
    imagePosition?: NonNullable<SiteContent["galleryItems"]>[number]["imagePosition"];
  }>;
  services: Array<{
    title: string;
    description: string;
    imageSrc?: string;
    imagePosition?: SiteContent["services"][number]["imagePosition"];
  }>;
  products: SiteContent["products"];
  testimonials: SiteContent["testimonials"];
  faqs: SiteContent["faqs"];
};

type LocalEditorErrorResponse = {
  ok?: boolean;
  message?: string;
  fields?: {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  };
};

type LocalEditorAiResponse = {
  ok?: boolean;
  message?: string;
  rawText?: string;
  content?: SiteContent;
  cursorStatus?: string;
  codexStatus?: string;
};

function takeEditorItems<T>(items: T[] | undefined, fallback: T[], minimumCount: number, maximumCount: number) {
  const source = items && items.length > 0 ? items : fallback;
  return source.slice(0, Math.max(minimumCount, Math.min(source.length, maximumCount)));
}

function describeFieldErrors(payload?: LocalEditorErrorResponse["fields"]) {
  if (!payload) {
    return "";
  }

  const errors = Object.entries(payload.fieldErrors ?? {})
    .flatMap(([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`))
    .slice(0, 4);

  if (errors.length > 0) {
    return errors.join(" | ");
  }

  if (payload.formErrors && payload.formErrors.length > 0) {
    return payload.formErrors.slice(0, 2).join(" | ");
  }

  return "";
}

function getDefaultImagePosition(position?: { x?: number; y?: number }) {
  return {
    x: typeof position?.x === "number" ? Math.min(100, Math.max(0, position.x)) : 50,
    y: typeof position?.y === "number" ? Math.min(100, Math.max(0, position.y)) : 50,
  };
}

function isValidHexColor(value: unknown) {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value.trim());
}

function isValidEmail(value: unknown) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeThemeMode(value: unknown) {
  return value === "Dark" ? "Dark" : "Light";
}

function normalizeContactEmail(value: unknown, fallback?: unknown) {
  if (isValidEmail(value)) {
    return String(value).trim();
  }

  if (isValidEmail(fallback)) {
    return String(fallback).trim();
  }

  return "editor@local.dev";
}

function normalizeWhatsappNumber(value: unknown, fallback?: unknown) {
  const normalize = (input: unknown) =>
    String(input || "")
      .replace(/[^\d+\s()-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const current = normalize(value);
  if (current.length >= 6) {
    return current;
  }

  const nextFallback = normalize(fallback);
  if (nextFallback.length >= 6) {
    return nextFallback;
  }

  return "51999999999";
}

function buildVisibilityArray(length: number, source?: boolean[]) {
  return Array.from({ length }, (_, index) => source?.[index] !== false);
}

function buildDefaultUiText(profile: ClientProfile, content: SiteContent): NonNullable<SiteContent["uiText"]> {
  const labels = getStoryLabels(profile, content);

  return {
    heroLabel: content.uiText?.heroLabel?.trim() || labels.heroLabel,
    supportLabel: content.uiText?.supportLabel?.trim() || labels.supportLabel,
    proofLabel: content.uiText?.proofLabel?.trim() || labels.proofLabel,
    storyChip: content.uiText?.storyChip?.trim() || "Narrativa de conversion",
    storyTitle: content.uiText?.storyTitle?.trim() || "Experiencia clara y lista para convertir.",
    testimonialsChip: content.uiText?.testimonialsChip?.trim() || labels.proofLabel,
    testimonialsTitle: content.uiText?.testimonialsTitle?.trim() || "Resultados reales y prueba social clara.",
    faqChip: content.uiText?.faqChip?.trim() || "Preguntas frecuentes",
    faqTitle: content.uiText?.faqTitle?.trim() || "Respuestas claras antes del contacto.",
  };
}

function buildDefaultBookingWidget(profile: ClientProfile, content: SiteContent): NonNullable<SiteContent["bookingWidget"]> {
  const preset = detectBookingWidgetPreset(profile, content);

  return resolveBookingWidget(
    {
      ...content,
      bookingWidget: {
        ...buildBookingWidgetFromPreset(preset, content),
        ...(content.bookingWidget || {}),
        preset,
      },
    },
    profile,
  );
}

function buildInitialState(profile: ClientProfile, content: SiteContent): EditorState {
  const galleryFallback = content.galleryKeywords.slice(0, 5).map((keyword) => ({
    title: keyword,
    subtitle: content.brand.name,
    imageSrc: "",
  }));
  const highlights = takeEditorItems(content.highlights, content.highlights, 3, 8);
  const galleryItems = takeEditorItems(content.galleryItems, galleryFallback, 3, 8).map((item) => ({
    ...item,
    imageSrc: item.imageSrc ?? "",
    imagePosition: getDefaultImagePosition(item.imagePosition),
  }));
  const services = takeEditorItems(content.services, content.services, 3, 8).map((service) => ({
    ...service,
    imageSrc: service.imageSrc ?? "",
    imagePosition: getDefaultImagePosition(service.imagePosition),
  }));
  const products = takeEditorItems(content.products, content.products, 1, 8).map((product) => ({
    ...product,
    imageSrc: product.imageSrc ?? "",
    imagePosition: getDefaultImagePosition(product.imagePosition),
  }));
  const testimonials = content.testimonials.slice(0, 20);
  const faqs = content.faqs.slice(0, 10);
  const stats = content.stats.slice(0, 6);
  const pages =
    content.bookingWidget?.preset === "hotel"
      ? HOTEL_NAV_ITEMS.map((item, index) => content.pages[index]?.trim() || item.label)
      : content.pages.slice(0, 7);

  return {
    brand: {
      ...content.brand,
      heroImageSrc: content.brand.heroImageSrc ?? "",
      heroImagePosition: getDefaultImagePosition(content.brand.heroImagePosition),
    },
    narrative: content.narrative,
    stats,
    theme: {
      ...content.theme,
      mode: normalizeThemeMode(content.theme.mode),
      visualStyle: content.theme.visualStyle?.trim() || profile.brandConfig.visualStyle || "editorial",
      layoutMode: content.theme.layoutMode || profile.brandConfig.layoutMode || "soft",
      shellMode: content.theme.shellMode || profile.brandConfig.shellMode || "framed",
      textAlign: content.theme.textAlign || "center",
      buttonShape: content.theme.buttonShape || "rounded",
      accentColor: isValidHexColor(content.theme.accentColor) ? content.theme.accentColor : profile.brandConfig.accentColor || "#2563EE",
      accentAltColor: isValidHexColor(content.theme.accentAltColor) ? content.theme.accentAltColor : profile.brandConfig.accentAltColor || "#0F172A",
    },
    uiText: buildDefaultUiText(profile, content),
    visibility: {
      highlights: buildVisibilityArray(highlights.length, content.visibility?.highlights),
      galleryItems: buildVisibilityArray(galleryItems.length, content.visibility?.galleryItems),
      services: buildVisibilityArray(services.length, content.visibility?.services),
      products: buildVisibilityArray(products.length, content.visibility?.products),
      testimonials: buildVisibilityArray(testimonials.length, content.visibility?.testimonials),
      faqs: buildVisibilityArray(faqs.length, content.visibility?.faqs),
    },
    contact: {
      ...content.contact,
      whatsappNumber: normalizeWhatsappNumber(content.contact.whatsappNumber, profile.brandConfig.whatsappNumber),
      email: normalizeContactEmail(content.contact.email, profile.brandConfig.email),
    },
    location: {
      address: content.location?.address || "",
      city: content.location?.city || "",
      hours: content.location?.hours || "",
      mapsEmbedUrl: content.location?.mapsEmbedUrl || "",
      mapsLink: content.location?.mapsLink || "",
    },
    bookingWidget: buildDefaultBookingWidget(profile, content),
    pages,
    highlights,
    galleryItems,
    services,
    products,
    testimonials,
    faqs,
  };
}

const visualStyleLabelMap: Record<(typeof VISUAL_STYLE_OPTIONS)[number], string> = {
  auto: "Auto",
  normal: "Normal",
  luxury: "Luxury",
  minimalista: "Minimalista",
  bento: "Bento",
  editorial: "Editorial",
  immersive: "Immersive",
  "saas-modern-ui": "SaaS Modern UI",
  glassmorphism: "Glassmorphism",
  "minimal-business": "Minimal Business",
  "web-visual-imagenes-grandes": "Web visual con imagenes grandes",
  "interactive-motion-ui": "Interactive Motion UI",
  tecnologico: "Tecnologico",
  espacial: "Espacial",
  moderno: "Moderno",
  editor: "Editor",
  premium: "Premium",
  pro: "Pro",
  "3d": "3D",
  "9bit": "9bit",
};

const layoutModeLabelMap: Record<(typeof LAYOUT_MODE_OPTIONS)[number], string> = {
  soft: "Split limpio",
  block: "Bento modular",
  fluid: "Inmersivo",
  mixed: "Asimetrico",
};

const shellModeLabelMap: Record<(typeof SHELL_MODE_OPTIONS)[number], string> = {
  framed: "Framed",
  "framed-seamless": "Framed seamless",
  "full-bleed": "Full bleed",
  seamless: "Seamless",
};

const buttonShapeLabelMap = {
  rounded: "Redondeado",
  square: "Rectangular",
} as const;

function buildPreviewContent(base: SiteContent, draft: EditorState): SiteContent {
  return {
    ...base,
    brand: draft.brand,
    narrative: draft.narrative,
    stats: draft.stats,
    theme: draft.theme,
    uiText: draft.uiText,
    visibility: draft.visibility,
    contact: draft.contact,
    location: draft.location,
    bookingWidget: draft.bookingWidget,
    pages: draft.pages,
    highlights: draft.highlights,
    galleryItems: draft.galleryItems,
    services: draft.services,
    products: draft.products,
    testimonials: draft.testimonials,
    faqs: draft.faqs,
  };
}

function applyImageTargetToState(state: EditorState, target: string, src: string): EditorState {
  if (target === "brand.heroImageSrc") {
    return {
      ...state,
      brand: {
        ...state.brand,
        heroImageSrc: src,
      },
    };
  }

  const galleryMatch = target.match(/^galleryItems\.(\d+)\.imageSrc$/);
  if (galleryMatch) {
    const index = Number(galleryMatch[1]);
    return {
      ...state,
      galleryItems: state.galleryItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              imageSrc: src,
            }
          : item,
      ),
    };
  }

  const serviceMatch = target.match(/^services\.(\d+)\.imageSrc$/);
  if (serviceMatch) {
    const index = Number(serviceMatch[1]);
    return {
      ...state,
      services: state.services.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              imageSrc: src,
            }
          : item,
      ),
    };
  }

  const productMatch = target.match(/^products\.(\d+)\.imageSrc$/);
  if (productMatch) {
    const index = Number(productMatch[1]);
    return {
      ...state,
      products: state.products.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              imageSrc: src,
            }
          : item,
      ),
    };
  }

  const testimonialMatch = target.match(/^testimonials\.(\d+)\.avatarSrc$/);
  if (testimonialMatch) {
    const index = Number(testimonialMatch[1]);
    return {
      ...state,
      testimonials: state.testimonials.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              avatarSrc: src,
            }
          : item,
      ),
    };
  }

  return state;
}

function parseIndexedField(fieldKey: string, collectionKey: "galleryItems" | "services") {
  const pattern = new RegExp(`^${collectionKey}\\.(\\d+)\\.(title|subtitle|description)$`);
  const match = fieldKey.match(pattern);
  if (!match) {
    return null;
  }

  return {
    index: Number(match[1]),
    key: match[2] as "title" | "subtitle" | "description",
  };
}

export function LocalEditor({ profile, content, rawInput, referenceSnapshot = null }: LocalEditorProps) {
  const [editorProfile, setEditorProfile] = useState(profile);
  const initialState = useMemo(() => buildInitialState(editorProfile, content), [content, editorProfile]);
  const draftStorageKey = useMemo(() => `codex-local-editor-draft:${editorProfile.clientCode}`, [editorProfile.clientCode]);
  const restoredDraftRef = useRef(false);
  const bypassUnloadPromptRef = useRef(false);
  const previewShellRef = useRef<HTMLDivElement>(null);
  const formRef = useRef(initialState);
  const [form, setForm] = useState<EditorState>(initialState);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initialState));
  const [businessNotes, setBusinessNotes] = useState(rawInput);
  const [savedBusinessNotes, setSavedBusinessNotes] = useState(rawInput);
  const [status, setStatus] = useState("Preview activa. Haz clic en titulares y textos clave para editar inline, o usa el panel lateral para cambios finos.");
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingAi, setIsApplyingAi] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState<EditorSection>("ai");
  const [viewport, setViewport] = useState<EditorViewport>("desktop");
  const [previewPageSlug, setPreviewPageSlug] = useState<HotelPageSlug>("hotel");
  const [activeField, setActiveField] = useState("");
  const currentSnapshot = useMemo(() => JSON.stringify(form), [form]);
  const hasPendingChanges = currentSnapshot !== savedSnapshot || businessNotes.trim() !== savedBusinessNotes.trim();
  const previewContent = useMemo(() => buildPreviewContent(content, form), [content, form]);
  const supportsHotelPagePreview =
    previewContent.bookingWidget?.preset === "hotel" ||
    Boolean(referenceSnapshot?.sourceUrl && /(hotel|hoteler|hostal|hostel|resort|alojamiento|habitacion|suite|turismo|hospitality)/i.test(referenceSnapshot.sourceUrl));

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    setEditorProfile(profile);
  }, [profile]);

  useEffect(() => {
    setBusinessNotes(rawInput);
    setSavedBusinessNotes(rawInput);
  }, [rawInput]);

  useEffect(() => {
    setForm(initialState);
    setSavedSnapshot(JSON.stringify(initialState));
    restoredDraftRef.current = false;

    if (typeof window === "undefined") {
      return;
    }

    const storedDraft = window.sessionStorage.getItem(draftStorageKey);
    if (!storedDraft) {
      return;
    }

    try {
      const parsedDraft = JSON.parse(storedDraft) as EditorState;
      setForm(parsedDraft);
      setStatus("Restauramos un borrador local sin guardar. Revisa el preview y guarda cuando termines.");
      restoredDraftRef.current = true;
    } catch {
      window.sessionStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey, initialState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (hasPendingChanges) {
      window.sessionStorage.setItem(draftStorageKey, currentSnapshot);
      return;
    }

    window.sessionStorage.removeItem(draftStorageKey);
  }, [currentSnapshot, draftStorageKey, hasPendingChanges]);

  useEffect(() => {
    if (!hasPendingChanges || typeof window === "undefined") {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (bypassUnloadPromptRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasPendingChanges]);

  function setBrandField<K extends keyof EditorState["brand"]>(key: K, value: EditorState["brand"][K]) {
    setForm((current) => ({
      ...current,
      brand: {
        ...current.brand,
        [key]: value,
      },
    }));
  }

  function setNarrativeField<K extends keyof EditorState["narrative"]>(key: K, value: EditorState["narrative"][K]) {
    setForm((current) => ({
      ...current,
      narrative: {
        ...current.narrative,
        [key]: value,
      },
    }));
  }

  function setStatField(index: number, key: keyof SiteContent["stats"][number], value: string) {
    setForm((current) => ({
      ...current,
      stats: current.stats.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    }));
  }

  function setThemeField<K extends keyof EditorState["theme"]>(key: K, value: EditorState["theme"][K]) {
    setForm((current) => ({
      ...current,
      theme: {
        ...current.theme,
        [key]: value,
      },
    }));
  }

  function setUiTextField<K extends keyof EditorState["uiText"]>(key: K, value: EditorState["uiText"][K]) {
    setForm((current) => ({
      ...current,
      uiText: {
        ...current.uiText,
        [key]: value,
      },
    }));
  }

  function setBrandImagePosition(axis: "x" | "y", value: number) {
    setForm((current) => ({
      ...current,
      brand: {
        ...current.brand,
        heroImagePosition: {
          ...getDefaultImagePosition(current.brand.heroImagePosition),
          [axis]: value,
        },
      },
    }));
  }

  function setContactField<K extends keyof EditorState["contact"]>(key: K, value: EditorState["contact"][K]) {
    setForm((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [key]: value,
      },
    }));
  }

  function setLocationField<K extends keyof EditorState["location"]>(key: K, value: EditorState["location"][K]) {
    setForm((current) => ({
      ...current,
      location: {
        ...current.location,
        [key]: value,
      },
    }));
  }

  function setBookingField<K extends keyof EditorState["bookingWidget"]>(key: K, value: EditorState["bookingWidget"][K]) {
    setForm((current) => ({
      ...current,
      bookingWidget: {
        ...current.bookingWidget,
        [key]: value,
      },
    }));
  }

  function applyBookingPreset(preset: NonNullable<SiteContent["bookingWidget"]>["preset"]) {
    if (!preset) {
      return;
    }

    setForm((current) => ({
      ...current,
      bookingWidget: {
        ...buildBookingWidgetFromPreset(preset, buildPreviewContent(content, current)),
        preset,
      },
    }));
    setStatus(`Preset del widget actualizado a ${BOOKING_WIDGET_PRESET_OPTIONS.find((option) => option.value === preset)?.label || preset}.`);
  }

  function setBookingOptionField(
    index: number,
    key: keyof EditorState["bookingWidget"]["options"][number],
    value: string | boolean | string[],
  ) {
    setForm((current) => ({
      ...current,
      bookingWidget: {
        ...current.bookingWidget,
        options: current.bookingWidget.options.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [key]: value,
              }
            : item,
        ),
      },
    }));
  }

  function setPageField(index: number, value: string) {
    setForm((current) => ({
      ...current,
      pages: current.pages.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function setVisibilityField(key: keyof EditorState["visibility"], index: number, visible: boolean) {
    setForm((current) => ({
      ...current,
      visibility: {
        ...current.visibility,
        [key]: (current.visibility[key] ?? []).map((item, itemIndex) => (itemIndex === index ? visible : item)),
      },
    }));
  }

  function setHighlight(index: number, value: string) {
    setForm((current) => ({
      ...current,
      highlights: current.highlights.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function setGalleryField(index: number, key: "title" | "subtitle" | "imageSrc", value: string) {
    setForm((current) => ({
      ...current,
      galleryItems: current.galleryItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    }));
  }

  function setGalleryImagePosition(index: number, axis: "x" | "y", value: number) {
    setForm((current) => ({
      ...current,
      galleryItems: current.galleryItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              imagePosition: {
                ...getDefaultImagePosition(item.imagePosition),
                [axis]: value,
              },
            }
          : item,
      ),
    }));
  }

  function setServiceField(index: number, key: "title" | "description" | "imageSrc", value: string) {
    setForm((current) => ({
      ...current,
      services: current.services.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    }));
  }

  function setServiceImagePosition(index: number, axis: "x" | "y", value: number) {
    setForm((current) => ({
      ...current,
      services: current.services.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              imagePosition: {
                ...getDefaultImagePosition(item.imagePosition),
                [axis]: value,
              },
            }
          : item,
      ),
    }));
  }

  function removeArrayItem<T>(items: T[], index: number) {
    return items.filter((_, itemIndex) => itemIndex !== index);
  }

  function removeEditorItem(collection: EditorCollectionKey, index: number) {
    setForm((current) => {
      switch (collection) {
        case "galleryItems":
          return {
            ...current,
            galleryItems: removeArrayItem(current.galleryItems, index),
            visibility: {
              ...current.visibility,
              galleryItems: removeArrayItem(current.visibility.galleryItems ?? [], index),
            },
          };
        case "services":
          return {
            ...current,
            services: removeArrayItem(current.services, index),
            visibility: {
              ...current.visibility,
              services: removeArrayItem(current.visibility.services ?? [], index),
            },
          };
        case "products":
          return {
            ...current,
            products: removeArrayItem(current.products, index),
            visibility: {
              ...current.visibility,
              products: removeArrayItem((current.visibility as EditorState["visibility"] & { products?: boolean[] }).products ?? [], index),
            },
          };
        case "testimonials":
          return {
            ...current,
            testimonials: removeArrayItem(current.testimonials, index),
            visibility: {
              ...current.visibility,
              testimonials: removeArrayItem(current.visibility.testimonials ?? [], index),
            },
          };
        case "faqs":
          return {
            ...current,
            faqs: removeArrayItem(current.faqs, index),
            visibility: {
              ...current.visibility,
              faqs: removeArrayItem(current.visibility.faqs ?? [], index),
            },
          };
      }
    });
    setStatus(`Elemento eliminado. El layout se reordeno automaticamente.`);
  }

  function setTestimonialField(index: number, key: keyof SiteContent["testimonials"][number], value: string | number | undefined) {
    setForm((current) => ({
      ...current,
      testimonials: current.testimonials.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    }));
  }

  function setFaqField(index: number, key: keyof SiteContent["faqs"][number], value: string) {
    setForm((current) => ({
      ...current,
      faqs: current.faqs.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    }));
  }

  function addGalleryItem() {
    setForm((current) => {
      if (current.galleryItems.length >= 8) {
        return current;
      }

      return {
        ...current,
        galleryItems: [
          ...current.galleryItems,
          {
            title: `Imagen ${current.galleryItems.length + 1}`,
            subtitle: current.brand.name,
            imageSrc: "",
            imagePosition: { x: 50, y: 50 },
          },
        ],
        visibility: {
          ...current.visibility,
          galleryItems: [...(current.visibility.galleryItems ?? []), true],
        },
      };
    });
  }

  function addServiceItem() {
    setForm((current) => {
      if (current.services.length >= 8) {
        return current;
      }

      return {
        ...current,
        services: [
          ...current.services,
          {
            title: `Bloque ${current.services.length + 1}`,
            description: `Descripcion breve del bloque ${current.services.length + 1}.`,
            imageSrc: "",
            imagePosition: { x: 50, y: 50 },
          },
        ],
        visibility: {
          ...current.visibility,
          services: [...(current.visibility.services ?? []), true],
        },
      };
    });
  }

  function addTestimonialItem() {
    setForm((current) => {
      if (current.testimonials.length >= 20) {
        return current;
      }

      return {
        ...current,
        testimonials: [
          ...current.testimonials,
          {
            name: `Caso ${current.testimonials.length + 1}`,
            role: "Cliente real",
            quote: "Nueva prueba social lista para editar desde el panel local.",
          },
        ],
        visibility: {
          ...current.visibility,
          testimonials: [...(current.visibility.testimonials ?? []), true],
        },
      };
    });
  }

  function addFaqItem() {
    setForm((current) => {
      if (current.faqs.length >= 10) {
        return current;
      }

      return {
        ...current,
        faqs: [
          ...current.faqs,
          {
            question: `Nueva pregunta ${current.faqs.length + 1}`,
            answer: "Respuesta inicial lista para reemplazar desde el editor local.",
          },
        ],
        visibility: {
          ...current.visibility,
          faqs: [...(current.visibility.faqs ?? []), true],
        },
      };
    });
  }

  function addBookingOption() {
    setForm((current) => {
      if (current.bookingWidget.options.length >= 8) {
        return current;
      }

      return {
        ...current,
        bookingWidget: {
          ...current.bookingWidget,
          options: [
            ...current.bookingWidget.options,
            {
              id: `plan-${current.bookingWidget.options.length + 1}`,
              label: `Opcion ${current.bookingWidget.options.length + 1}`,
              roomType: "Detalle por confirmar",
              price: "Consultar",
              rateLabel: "precio base",
              stayLabel: "A coordinar",
              summary: "Nueva opcion lista para editar.",
              perks: ["Beneficio 1", "Beneficio 2"],
              emoji: "OK",
              badge: "",
              highlighted: false,
            },
          ],
        },
      };
    });
  }

  function removeBookingOption(index: number) {
    setForm((current) => {
      if (current.bookingWidget.options.length <= 1) {
        return current;
      }

      return {
        ...current,
        bookingWidget: {
          ...current.bookingWidget,
          options: current.bookingWidget.options.filter((_, itemIndex) => itemIndex !== index),
        },
      };
    });
  }

  function setInlineTextField(fieldKey: string, value: string) {
    const nextValue = value.trim();
    if (!nextValue) {
      return;
    }

    const statField = fieldKey.match(/^stats\.(\d+)\.(label|value)$/);
    if (statField) {
      setStatField(Number(statField[1]), statField[2] as keyof SiteContent["stats"][number], nextValue);
      return;
    }

    const testimonialField = fieldKey.match(/^testimonials\.(\d+)\.(name|role|quote|location|segment)$/);
    if (testimonialField) {
      setTestimonialField(Number(testimonialField[1]), testimonialField[2] as keyof SiteContent["testimonials"][number], nextValue);
      return;
    }

    const faqField = fieldKey.match(/^faqs\.(\d+)\.(question|answer)$/);
    if (faqField) {
      setFaqField(Number(faqField[1]), faqField[2] as keyof SiteContent["faqs"][number], nextValue);
      return;
    }

    const pageField = fieldKey.match(/^pages\.(\d+)$/);
    if (pageField) {
      setPageField(Number(pageField[1]), nextValue);
      return;
    }

    const highlightField = fieldKey.match(/^highlights\.(\d+)$/);
    if (highlightField) {
      setHighlight(Number(highlightField[1]), nextValue);
      return;
    }

    const galleryField = parseIndexedField(fieldKey, "galleryItems");
    if (galleryField && galleryField.key !== "description") {
      setGalleryField(galleryField.index, galleryField.key, nextValue);
      return;
    }

    const serviceField = parseIndexedField(fieldKey, "services");
    if (serviceField) {
      setServiceField(serviceField.index, serviceField.key === "subtitle" ? "title" : serviceField.key, nextValue);
      return;
    }

    const bookingOptionField = fieldKey.match(/^bookingWidget\.options\.(\d+)\.(label|roomType|price|rateLabel|stayLabel|summary|badge)$/);
    if (bookingOptionField) {
      setBookingOptionField(
        Number(bookingOptionField[1]),
        bookingOptionField[2] as keyof EditorState["bookingWidget"]["options"][number],
        nextValue,
      );
      return;
    }

    const bookingField = fieldKey.match(
      /^bookingWidget\.(title|description|adminLabel|adminRole|adminStatus|actionVerb|triggerChatLabel|triggerChatHint|triggerActionLabel|triggerActionHint|tabChatLabel|tabActionLabel|chatCtaLabel|directWhatsappLabel|directWhatsappHint|bookingCtaLabel|summaryLabel|summaryText|formNameLabel|formNamePlaceholder|scheduleLabel|schedulePlaceholder|quantityLabel|notesLabel|notesPlaceholder|selectionTitle|detailLabel|priceLabel|timelineLabel)$/,
    );
    if (bookingField) {
      setBookingField(bookingField[1] as keyof EditorState["bookingWidget"], nextValue);
      return;
    }

    switch (fieldKey) {
      case "brand.name":
        setBrandField("name", nextValue);
        return;
      case "brand.heroTag":
        setBrandField("heroTag", nextValue);
        return;
      case "brand.headline":
        setBrandField("headline", nextValue);
        return;
      case "brand.subheadline":
        setBrandField("subheadline", nextValue);
        return;
      case "brand.description":
        setBrandField("description", nextValue);
        return;
      case "brand.primaryCtaLabel":
        setBrandField("primaryCtaLabel", nextValue);
        return;
      case "brand.secondaryCtaLabel":
        setBrandField("secondaryCtaLabel", nextValue);
        return;
      case "narrative.title":
        setNarrativeField("title", nextValue);
        return;
      case "narrative.body":
        setNarrativeField("body", nextValue);
        return;
      case "narrative.goal":
        setNarrativeField("goal", nextValue);
        return;
      case "contact.title":
        setContactField("title", nextValue);
        return;
      case "contact.description":
        setContactField("description", nextValue);
        return;
      case "location.address":
        setLocationField("address", nextValue);
        return;
      case "location.city":
        setLocationField("city", nextValue);
        return;
      case "location.hours":
        setLocationField("hours", nextValue);
        return;
      case "uiText.heroLabel":
        setUiTextField("heroLabel", nextValue);
        return;
      case "uiText.supportLabel":
        setUiTextField("supportLabel", nextValue);
        return;
      case "uiText.proofLabel":
        setUiTextField("proofLabel", nextValue);
        return;
      case "uiText.storyChip":
        setUiTextField("storyChip", nextValue);
        return;
      case "uiText.storyTitle":
        setUiTextField("storyTitle", nextValue);
        return;
      case "uiText.testimonialsChip":
        setUiTextField("testimonialsChip", nextValue);
        return;
      case "uiText.testimonialsTitle":
        setUiTextField("testimonialsTitle", nextValue);
        return;
      case "uiText.faqChip":
        setUiTextField("faqChip", nextValue);
        return;
      case "uiText.faqTitle":
        setUiTextField("faqTitle", nextValue);
        return;
      default:
        return;
    }
  }

  async function persistEditorState(nextState: EditorState, savingMessage: string, successMessage: string) {
    setIsSaving(true);
    setStatus(savingMessage);

    try {
      const response = await fetch("/api/local-editor/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextState),
      });

      const data = (await response.json()) as LocalEditorErrorResponse;
      if (!response.ok) {
        const details = describeFieldErrors(data.fields);
        throw new Error(details ? `${data.message || "No se pudo guardar el proyecto local."} ${details}` : data.message || "No se pudo guardar el proyecto local.");
      }

      setSavedSnapshot(JSON.stringify(nextState));
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(draftStorageKey);
      }
      setStatus(successMessage);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error inesperado guardando.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  async function settlePendingFieldEdits() {
    if (typeof window === "undefined") {
      return formRef.current;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });

    return formRef.current;
  }

  async function runAiWorkflow(action: "organize" | "apply") {
    const trimmedNotes = businessNotes.trim();
    if (!trimmedNotes) {
      setStatus("Pega primero los datos generales del negocio para usar el flujo IA.");
      setSection("ai");
      return;
    }

    const nextState = await settlePendingFieldEdits();
    setIsApplyingAi(true);
    setStatus(
      action === "organize"
        ? "Ordenando los datos generales segun el tipo de proyecto..."
        : "Aplicando copy pro al proyecto y sincronizando el preview...",
    );

    try {
      const response = await fetch("/api/local-editor/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          rawText: trimmedNotes,
          businessName: nextState.brand.name || editorProfile.businessName,
          projectType: editorProfile.projectType,
          industry: editorProfile.industry,
          whatsapp: nextState.contact.whatsappNumber,
          email: nextState.contact.email,
        }),
      });

      const data = (await response.json()) as LocalEditorAiResponse;
      if (!response.ok) {
        throw new Error(data.message || "No se pudo ejecutar el flujo IA.");
      }

      if (data.rawText) {
        setBusinessNotes(data.rawText);
      }

      if (action === "apply" && data.content) {
        const nextFormState = buildInitialState(editorProfile, data.content);
        setForm(nextFormState);
        setSavedSnapshot(JSON.stringify(nextFormState));
        setSavedBusinessNotes(data.rawText || trimmedNotes);
        setActiveField("");
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(draftStorageKey);
        }
      }

      const suffixParts = [data.cursorStatus, data.codexStatus].filter(Boolean);
      const suffix = suffixParts.length > 0 ? ` ${suffixParts.join(" ")}` : "";
      setStatus(`${data.message || "Flujo IA completado."}${suffix}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo ejecutar el flujo IA.");
    } finally {
      setIsApplyingAi(false);
    }
  }

  async function uploadImage(file: File, fieldKey: string, target: string) {
    const payload = new FormData();
    payload.append("file", file);
    payload.append("target", target);
    setUploadingField(fieldKey);
    setStatus(`Subiendo imagen para ${fieldKey}...`);

    try {
      const response = await fetch("/api/local-editor/upload", {
        method: "POST",
        body: payload,
      });

      const data = (await response.json()) as { ok?: boolean; src?: string; message?: string };
      if (!response.ok || !data.src) {
        throw new Error(data.message || "No se pudo subir la imagen.");
      }

      setStatus(`Imagen cargada para ${fieldKey}. Preview actualizada.`);
      return data.src;
    } finally {
      setUploadingField("");
    }
  }

  async function onHeroImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const target = "brand.heroImageSrc";
      const src = await uploadImage(file, "hero", target);
      setForm((current) => applyImageTargetToState(current, target, src));
      setSavedSnapshot((current) => JSON.stringify(applyImageTargetToState(JSON.parse(current) as EditorState, target, src)));
      setStatus("Imagen hero guardada en local y visible en el preview.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      event.target.value = "";
    }
  }

  async function onGalleryImageChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const target = `galleryItems.${index}.imageSrc`;
      const src = await uploadImage(file, `galeria ${index + 1}`, target);
      setForm((current) => applyImageTargetToState(current, target, src));
      setSavedSnapshot((current) => JSON.stringify(applyImageTargetToState(JSON.parse(current) as EditorState, target, src)));
      setStatus(`Imagen de galeria ${index + 1} guardada en local y visible en el preview.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      event.target.value = "";
    }
  }

  async function onServiceImageChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const target = `services.${index}.imageSrc`;
      const src = await uploadImage(file, `servicio ${index + 1}`, target);
      setForm((current) => applyImageTargetToState(current, target, src));
      setSavedSnapshot((current) => JSON.stringify(applyImageTargetToState(JSON.parse(current) as EditorState, target, src)));
      setStatus(`Imagen de servicio ${index + 1} guardada en local y visible en el preview.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      event.target.value = "";
    }
  }

  async function onProductImageChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const target = `products.${index}.imageSrc`;
      const src = await uploadImage(file, `producto ${index + 1}`, target);
      setForm((current) => applyImageTargetToState(current, target, src));
      setSavedSnapshot((current) => JSON.stringify(applyImageTargetToState(JSON.parse(current) as EditorState, target, src)));
      setStatus(`Imagen de producto ${index + 1} guardada en local y visible en el preview.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      event.target.value = "";
    }
  }

  async function onTestimonialImageChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const target = `testimonials.${index}.avatarSrc`;
      const src = await uploadImage(file, `testimonio ${index + 1}`, target);
      setForm((current) => applyImageTargetToState(current, target, src));
      setSavedSnapshot((current) => JSON.stringify(applyImageTargetToState(JSON.parse(current) as EditorState, target, src)));
      setStatus(`Imagen de testimonio ${index + 1} guardada en local y visible en el preview.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleSave() {
    if (businessNotes.trim() !== savedBusinessNotes.trim()) {
      setStatus("Hay datos generales del negocio pendientes. Usa Guardar + IA para aplicarlos al sitio.");
      setSection("ai");
      return;
    }

    try {
      const nextState = await settlePendingFieldEdits();
      await persistEditorState(nextState, "Guardando cambios en el proyecto local...", "Guardado real completado. El preview, el editor y localhost quedaron sincronizados.");
    } catch (error) {
      if (!(error instanceof Error)) {
        setStatus("Error inesperado guardando.");
      }
    }
  }

  async function discardPendingChanges() {
    await settlePendingFieldEdits();
    setForm(JSON.parse(savedSnapshot) as EditorState);
    setBusinessNotes(savedBusinessNotes);
    setActiveField("");
    setStatus("Volviste al ultimo estado guardado del editor local.");
  }

  async function handleOrganizeBusinessNotes() {
    await runAiWorkflow("organize");
  }

  async function handleApplyAiCopy() {
    await runAiWorkflow("apply");
  }

  async function openLiveSite() {
    if (typeof window === "undefined") {
      return;
    }

    if (isSaving) {
      return;
    }

    if (businessNotes.trim() !== savedBusinessNotes.trim()) {
      setStatus("Hay datos generales pendientes de aplicar. Usa Guardar + IA antes de abrir localhost.");
      setSection("ai");
      return;
    }

    try {
      const nextState = await settlePendingFieldEdits();
      if (JSON.stringify(nextState) !== savedSnapshot) {
        await persistEditorState(nextState, "Guardando cambios antes de abrir localhost...", "Guardado real completado. El preview, el editor y localhost quedaron sincronizados.");
      }

      bypassUnloadPromptRef.current = true;
      window.sessionStorage.removeItem(draftStorageKey);
      window.location.href = "/";
    } catch (error) {
      bypassUnloadPromptRef.current = false;
      if (!(error instanceof Error)) {
        setStatus("No se pudo guardar antes de abrir localhost.");
      }
    }
  }

  function getSectionLabel(targetSection: EditorSection) {
    switch (targetSection) {
      case "ai":
        return "IA";
      case "hero":
        return "Hero";
      case "visual":
        return "Visual";
      case "story":
        return "Texto";
      case "gallery":
        return "Galeria";
      case "services":
        return "Servicios";
      case "testimonials":
        return "Testimonios";
      case "faqs":
        return "FAQ";
      case "contact":
        return "Contacto";
      case "booking":
        return "Booking";
    }
  }

  function scrollToPreviewSection(targetSection: EditorSection) {
    if (typeof window === "undefined") {
      return;
    }

    if (targetSection === "ai") {
      return;
    }

    const target = previewShellRef.current?.querySelector<HTMLElement>(`[data-editor-section~="${targetSection}"]`);
    if (!target) {
      return;
    }

    const performScroll = () => {
      const top = target.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({
        top: Math.max(top, 0),
        behavior: "smooth",
      });
    };

    if (window.matchMedia("(max-width: 1180px)").matches) {
      setSidebarOpen(false);
      window.setTimeout(performScroll, 140);
      return;
    }

    performScroll();
  }

  function focusEditorSection(targetSection: EditorSection) {
    setSection(targetSection);
    setStatus(`Te movi a ${getSectionLabel(targetSection)} para editar esa zona directamente en el preview.`);
    scrollToPreviewSection(targetSection);
  }

  function handlePreviewPageChange(nextPageSlug: HotelPageSlug) {
    setPreviewPageSlug(nextPageSlug);
    setStatus(`Preview activa en ${HOTEL_NAV_ITEMS.find((item) => item.slug === nextPageSlug)?.label || "Hotel"}. Ahora puedes editar texto e imagenes inline en esa pagina.`);
  }

  function handleInlineFieldFocus(fieldKey: string, targetSection: EditorSection, label: string) {
    setActiveField(fieldKey);
    setSection(targetSection);
    setStatus(`Campo activo: ${label}. Puedes escribir inline o ajustar el detalle desde el panel lateral.`);
  }

  function handleInlineFieldChange(fieldKey: string, value: string, targetSection: EditorSection, label: string) {
    setInlineTextField(fieldKey, value);
    setActiveField(fieldKey);
    setSection(targetSection);
    setStatus(`Actualizaste ${label} inline. Guarda para dejar el cambio persistido en el proyecto.`);
  }

  const editorTextControls: EditorTextControls = {
    activeField,
    onFieldFocus: handleInlineFieldFocus,
    onFieldChange: handleInlineFieldChange,
  };

  function renderImagePositionControls(
    title: string,
    position: { x?: number; y?: number } | undefined,
    onAxisChange: (axis: "x" | "y", value: number) => void,
  ) {
    const current = getDefaultImagePosition(position);

    return (
      <div className="editor-image-position">
        <div className="editor-image-position-head">
          <strong>{title}</strong>
          <span>{Math.round(current.x)}% / {Math.round(current.y)}%</span>
        </div>
        <div className="editor-grid two">
          <label>
            Izquierda / derecha
            <input
              max={100}
              min={0}
              onChange={(event) => onAxisChange("x", Number(event.target.value))}
              type="range"
              value={current.x}
            />
          </label>
          <label>
            Arriba / abajo
            <input
              max={100}
              min={0}
              onChange={(event) => onAxisChange("y", Number(event.target.value))}
              type="range"
              value={current.y}
            />
          </label>
        </div>
        <div className="editor-position-presets">
          <button onClick={() => onAxisChange("x", 0)} type="button">Izquierda</button>
          <button onClick={() => onAxisChange("x", 50)} type="button">Centro X</button>
          <button onClick={() => onAxisChange("x", 100)} type="button">Derecha</button>
          <button onClick={() => onAxisChange("y", 0)} type="button">Arriba</button>
          <button onClick={() => onAxisChange("y", 50)} type="button">Centro Y</button>
          <button onClick={() => onAxisChange("y", 100)} type="button">Abajo</button>
        </div>
      </div>
    );
  }

  function renderVisibilityToggle(
    key: keyof EditorState["visibility"],
    index: number,
    label: string,
  ) {
    const isVisible = form.visibility[key]?.[index] !== false;

    return (
      <button
        aria-label={isVisible ? `Ocultar ${label}` : `Mostrar ${label}`}
        className={`editor-visibility-toggle${isVisible ? "" : " is-hidden"}`}
        onClick={() => setVisibilityField(key, index, !isVisible)}
        type="button"
      >
        {isVisible ? (
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6Z" />
            <circle cx="12" cy="12" r="3.2" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M3 3l18 18" />
            <path d="M10.6 6.2A11.2 11.2 0 0 1 12 6c6.2 0 10 6 10 6a17.6 17.6 0 0 1-3.4 4.1" />
            <path d="M6.2 6.4A18 18 0 0 0 2 12s3.8 6 10 6c1 0 2-.2 2.9-.5" />
            <path d="M9.9 9.9A3.2 3.2 0 0 0 12 15.2" />
          </svg>
        )}
      </button>
    );
  }

  function renderSection() {
    switch (section) {
      case "ai":
        return (
          <>
            <div className="editor-section-actions">
              <p>Pega aqui los datos generales del negocio en texto libre. No hace falta que escribas perfecto el FAQ o los testimonios: el flujo IA los ordena segun el tipo de proyecto.</p>
            </div>
            <label>
              Datos generales del negocio
              <textarea
                placeholder={"Ejemplo:\nMarca de moda femenina en Lima. Vendemos colecciones limitadas con enfoque editorial.\nObjetivo: vender por WhatsApp y mostrar catalogo.\nPublico: mujeres de 25 a 40.\nFortalezas: telas premium, drops pequenos, asesoramiento.\nObjeciones: tiempos de entrega, cambios, tallas.\nPrueba social: clientas recurrentes y pedidos por recomendacion."}
                rows={16}
                value={businessNotes}
                onChange={(event) => setBusinessNotes(event.target.value)}
              />
            </label>
            <div className="editor-section-actions">
              <p>Primero puedes ordenar el bloque para dejarlo limpio. Luego usa Guardar + IA para regenerar titulos, subtitulos, FAQ, testimonios y CTA directamente en la pagina, preservando tema, colores y layout.</p>
            </div>
            <div className="editor-grid two">
              <button disabled={isApplyingAi || uploadingField !== ""} onClick={handleOrganizeBusinessNotes} type="button">
                {isApplyingAi ? "Procesando..." : "Ordenar por tipo"}
              </button>
              <button disabled={isApplyingAi || uploadingField !== ""} onClick={handleApplyAiCopy} type="button">
                {isApplyingAi ? "Aplicando..." : "Guardar + IA"}
              </button>
            </div>
          </>
        );
      case "hero":
        return (
          <>
            <div className="editor-grid two">
              <label>
                Nombre visible
                <input value={form.brand.name} onChange={(event) => setBrandField("name", event.target.value)} />
              </label>
              <label>
                Hero tag
                <input value={form.brand.heroTag} onChange={(event) => setBrandField("heroTag", event.target.value)} />
              </label>
            </div>

            <label>
              Titular principal
              <textarea rows={3} value={form.brand.headline} onChange={(event) => setBrandField("headline", event.target.value)} />
            </label>

            <label>
              Subtitular
              <textarea rows={3} value={form.brand.subheadline} onChange={(event) => setBrandField("subheadline", event.target.value)} />
            </label>

            <label>
              Descripcion corta
              <textarea rows={3} value={form.brand.description} onChange={(event) => setBrandField("description", event.target.value)} />
            </label>

            <div className="editor-grid two">
              <label>
                CTA principal
                <input value={form.brand.primaryCtaLabel} onChange={(event) => setBrandField("primaryCtaLabel", event.target.value)} />
              </label>
              <label>
                Link principal
                <input value={form.brand.primaryCtaHref} onChange={(event) => setBrandField("primaryCtaHref", event.target.value)} />
              </label>
              <label>
                CTA secundario
                <input value={form.brand.secondaryCtaLabel} onChange={(event) => setBrandField("secondaryCtaLabel", event.target.value)} />
              </label>
              <label>
                Link secundario
                <input value={form.brand.secondaryCtaHref} onChange={(event) => setBrandField("secondaryCtaHref", event.target.value)} />
              </label>
            </div>

            <div className="editor-subcard">
              <div className="editor-subcard-head">
                <strong>Navegacion visible</strong>
              </div>
              <div className="editor-grid two">
                {form.pages.map((page, index) => (
                  <label key={`page-${index}`}>
                    Link {index + 1}
                    <input value={page} onChange={(event) => setPageField(index, event.target.value)} />
                  </label>
                ))}
              </div>
            </div>
          </>
        );
      case "visual":
        return (
          <>
            <div className="editor-grid two">
              <label>
                Tema
                <select value={form.theme.mode} onChange={(event) => setThemeField("mode", event.target.value as "Dark" | "Light")}>
                  <option value="Dark">Dark</option>
                  <option value="Light">Light</option>
                </select>
              </label>
              <label>
                Estilo visual
                <select
                  value={form.theme.visualStyle}
                  onChange={(e) => setThemeField("visualStyle", e.target.value)}
                  aria-label="Estilo visual"
                >
                  {VISUAL_STYLE_OPTIONS.map((style) => (
                    <option key={style} value={style}>
                      {visualStyleLabelMap[style]}
                    </option>
                  ))}
                  {!VISUAL_STYLE_OPTIONS.includes(form.theme.visualStyle.toLowerCase() as (typeof VISUAL_STYLE_OPTIONS)[number]) && form.theme.visualStyle ? (
                    <option value={form.theme.visualStyle}>{form.theme.visualStyle}</option>
                  ) : null}
                </select>
              </label>
              <label>
                Modo de layout
                <select value={form.theme.layoutMode || "soft"} onChange={(event) => setThemeField("layoutMode", event.target.value)}>
                  {LAYOUT_MODE_OPTIONS.map((mode) => (
                    <option key={mode} value={mode}>
                      {layoutModeLabelMap[mode]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Estructura real
                <select value={form.theme.shellMode || "framed"} onChange={(event) => setThemeField("shellMode", event.target.value)}>
                  {SHELL_MODE_OPTIONS.map((mode) => (
                    <option key={mode} value={mode}>
                      {shellModeLabelMap[mode]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Alineacion de texto
                <select value={form.theme.textAlign || "center"} onChange={(event) => setThemeField("textAlign", event.target.value as "left" | "center")}>
                  <option value="center">Centro</option>
                  <option value="left">Izquierda</option>
                </select>
              </label>
              <label>
                Forma de botones
                <select value={form.theme.buttonShape || "rounded"} onChange={(event) => setThemeField("buttonShape", event.target.value as "rounded" | "square")}>
                  {Object.entries(buttonShapeLabelMap).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="editor-grid two">
              <label>
                Color primario
                <div className="color-field">
                  <input type="color" value={form.theme.accentColor} onChange={(event) => setThemeField("accentColor", event.target.value)} />
                  <input value={form.theme.accentColor} onChange={(event) => setThemeField("accentColor", event.target.value)} />
                </div>
              </label>
              <label>
                Color secundario
                <div className="color-field">
                  <input type="color" value={form.theme.accentAltColor} onChange={(event) => setThemeField("accentAltColor", event.target.value)} />
                  <input value={form.theme.accentAltColor} onChange={(event) => setThemeField("accentAltColor", event.target.value)} />
                </div>
              </label>
            </div>

            <div className="editor-preview-strip">
              <div style={{ background: form.theme.accentColor }} />
              <div style={{ background: form.theme.accentAltColor }} />
            </div>

            <div className="upload-row compact">
              <div>
                <strong>Imagen hero</strong>
                <p>{form.brand.heroImageSrc || "Aun sin imagen cargada."}</p>
              </div>
              <label className="upload-button">
                {uploadingField === "hero" ? "Subiendo..." : "Subir hero"}
                <input accept="image/*" onChange={onHeroImageChange} type="file" />
              </label>
            </div>

            {renderImagePositionControls("Encuadre hero", form.brand.heroImagePosition, setBrandImagePosition)}
          </>
        );
      case "story":
        return (
          <>
            <label>
              Titulo de narrativa
              <input value={form.narrative.title} onChange={(event) => setNarrativeField("title", event.target.value)} />
            </label>
            <label>
              Cuerpo
              <textarea rows={3} value={form.narrative.body} onChange={(event) => setNarrativeField("body", event.target.value)} />
            </label>
            <label>
              Objetivo
              <textarea rows={2} value={form.narrative.goal} onChange={(event) => setNarrativeField("goal", event.target.value)} />
            </label>

            <div className="editor-stack">
              {form.highlights.map((highlight, index) => (
                <div className="editor-subcard editor-subcard-compact" key={`highlight-${index}`}>
                  <div className="editor-subcard-head">
                    <strong>Highlight {index + 1}</strong>
                    {renderVisibilityToggle("highlights", index, `highlight ${index + 1}`)}
                  </div>
                  <label>
                    Texto
                    <input value={highlight} onChange={(event) => setHighlight(index, event.target.value)} />
                  </label>
                </div>
              ))}
            </div>

            <div className="editor-subcard">
              <div className="editor-grid two">
                <label>
                  Label hero
                  <input value={form.uiText.heroLabel} onChange={(event) => setUiTextField("heroLabel", event.target.value)} />
                </label>
                <label>
                  Label soporte
                  <input value={form.uiText.supportLabel} onChange={(event) => setUiTextField("supportLabel", event.target.value)} />
                </label>
                <label>
                  Label prueba social
                  <input value={form.uiText.proofLabel} onChange={(event) => setUiTextField("proofLabel", event.target.value)} />
                </label>
                <label>
                  Chip narrativa
                  <input value={form.uiText.storyChip} onChange={(event) => setUiTextField("storyChip", event.target.value)} />
                </label>
              </div>

              <label>
                Titulo narrativa
                <textarea rows={3} value={form.uiText.storyTitle} onChange={(event) => setUiTextField("storyTitle", event.target.value)} />
              </label>
            </div>

            <div className="editor-subcard">
              <div className="editor-subcard-head">
                <strong>Metricas visibles</strong>
              </div>
              <div className="editor-stack">
                {form.stats.map((item, index) => (
                  <div className="editor-grid two" key={`stat-${index}`}>
                    <label>
                      Label {index + 1}
                      <input value={item.label} onChange={(event) => setStatField(index, "label", event.target.value)} />
                    </label>
                    <label>
                      Valor {index + 1}
                      <input value={item.value} onChange={(event) => setStatField(index, "value", event.target.value)} />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case "gallery":
        return (
          <>
            <div className="editor-section-actions">
              <p>Agrega o edita imagenes de coleccion. Cada bloque nuevo queda disponible de inmediato en preview y scroll local.</p>
              <button disabled={form.galleryItems.length >= 8} onClick={addGalleryItem} type="button">
                Agregar imagen
              </button>
            </div>
            <div className="editor-stack">
              {form.galleryItems.map((item, index) => (
                <div className={`editor-subcard${activeField.startsWith(`galleryItems.${index}.`) ? " is-active" : ""}`} key={`gallery-${index}`}>
                  <div className="editor-subcard-head">
                    <strong>Imagen {index + 1}</strong>
                    {renderVisibilityToggle("galleryItems", index, `imagen ${index + 1}`)}
                  </div>
                  <div className="editor-grid two">
                    <label>
                      Titulo
                      <input value={item.title} onChange={(event) => setGalleryField(index, "title", event.target.value)} />
                    </label>
                    <label>
                      Subtitulo
                      <input value={item.subtitle} onChange={(event) => setGalleryField(index, "subtitle", event.target.value)} />
                    </label>
                  </div>
                  <div className="upload-row compact">
                    <p>{item.imageSrc || "Sin imagen subida"}</p>
                    <label className="upload-button">
                      {uploadingField === `galeria ${index + 1}` ? "Subiendo..." : `Subir imagen ${index + 1}`}
                      <input accept="image/*" onChange={(event) => onGalleryImageChange(index, event)} type="file" />
                    </label>
                  </div>
                  {renderImagePositionControls(`Encuadre imagen ${index + 1}`, item.imagePosition, (axis, value) => setGalleryImagePosition(index, axis, value))}
                </div>
              ))}
            </div>
          </>
        );
      case "services":
        return (
          <>
            <div className="editor-section-actions">
              <p>Los bloques de producto o servicio se ordenan en filas automaticas y puedes seguir agregando sin romper el layout.</p>
              <button disabled={form.services.length >= 8} onClick={addServiceItem} type="button">
                Agregar bloque
              </button>
            </div>
            <div className="editor-stack">
              {form.services.map((service, index) => (
                <div className={`editor-subcard${activeField.startsWith(`services.${index}.`) ? " is-active" : ""}`} key={`service-${index}`}>
                  <div className="editor-subcard-head">
                    <strong>Bloque {index + 1}</strong>
                    {renderVisibilityToggle("services", index, `bloque ${index + 1}`)}
                  </div>
                  <label>
                    Titulo
                    <input value={service.title} onChange={(event) => setServiceField(index, "title", event.target.value)} />
                  </label>
                  <label>
                    Descripcion
                    <textarea rows={2} value={service.description} onChange={(event) => setServiceField(index, "description", event.target.value)} />
                  </label>
                  <div className="upload-row compact">
                    <p>{service.imageSrc || "Sin imagen subida"}</p>
                    <label className="upload-button">
                      {uploadingField === `servicio ${index + 1}` ? "Subiendo..." : `Subir imagen ${index + 1}`}
                      <input accept="image/*" onChange={(event) => onServiceImageChange(index, event)} type="file" />
                    </label>
                  </div>
                  {renderImagePositionControls(`Encuadre servicio ${index + 1}`, service.imagePosition, (axis, value) => setServiceImagePosition(index, axis, value))}
                </div>
              ))}
            </div>
            <div className="editor-section-actions">
              <p>Los productos tambien aceptan imagen inline desde el preview o subida directa desde aqui.</p>
            </div>
            <div className="editor-stack">
              {form.products.map((product, index) => (
                <div className="editor-subcard" key={`product-${index}`}>
                  <div className="editor-subcard-head">
                    <strong>Producto {index + 1}</strong>
                    {renderVisibilityToggle("products", index, `producto ${index + 1}`)}
                  </div>
                  <div className="editor-grid two">
                    <label>
                      Nombre
                      <input value={product.name} onChange={(event) => setForm((current) => ({ ...current, products: current.products.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} />
                    </label>
                    <label>
                      Precio
                      <input value={product.price} onChange={(event) => setForm((current) => ({ ...current, products: current.products.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item) }))} />
                    </label>
                  </div>
                  <label>
                    Descripcion
                    <textarea rows={2} value={product.description} onChange={(event) => setForm((current) => ({ ...current, products: current.products.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item) }))} />
                  </label>
                  <div className="upload-row compact">
                    <p>{product.imageSrc || "Sin imagen subida"}</p>
                    <label className="upload-button">
                      {uploadingField === `producto ${index + 1}` ? "Subiendo..." : `Subir imagen ${index + 1}`}
                      <input accept="image/*" onChange={(event) => onProductImageChange(index, event)} type="file" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case "testimonials":
        return (
          <>
            <div className="editor-section-actions">
              <p>Los testimonios se muestran en desktop en filas horizontales de hasta 4 tarjetas por linea.</p>
              <button disabled={form.testimonials.length >= 20} onClick={addTestimonialItem} type="button">
                Agregar testimonio
              </button>
            </div>
            <div className="editor-subcard">
              <div className="editor-grid two">
                <label>
                  Chip testimonios
                  <input value={form.uiText.testimonialsChip} onChange={(event) => setUiTextField("testimonialsChip", event.target.value)} />
                </label>
              </div>
              <label>
                Titulo testimonios
                <textarea rows={3} value={form.uiText.testimonialsTitle} onChange={(event) => setUiTextField("testimonialsTitle", event.target.value)} />
              </label>
            </div>
            <div className="editor-stack">
              {form.testimonials.map((testimonial, index) => (
                <div className="editor-subcard" key={`testimonial-${index}`}>
                  <div className="editor-subcard-head">
                    <strong>Testimonio {index + 1}</strong>
                    {renderVisibilityToggle("testimonials", index, `testimonio ${index + 1}`)}
                  </div>
                  <div className="editor-grid two">
                    <label>
                      Nombre
                      <input value={testimonial.name} onChange={(event) => setTestimonialField(index, "name", event.target.value)} />
                    </label>
                    <label>
                      Rol
                      <input value={testimonial.role} onChange={(event) => setTestimonialField(index, "role", event.target.value)} />
                    </label>
                  </div>
                  <label>
                    Cita
                    <textarea rows={3} value={testimonial.quote} onChange={(event) => setTestimonialField(index, "quote", event.target.value)} />
                  </label>
                  <div className="upload-row compact">
                    <p>{testimonial.avatarSrc || "Sin imagen subida"}</p>
                    <label className="upload-button">
                      {uploadingField === `testimonio ${index + 1}` ? "Subiendo..." : `Subir imagen ${index + 1}`}
                      <input accept="image/*" onChange={(event) => onTestimonialImageChange(index, event)} type="file" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case "faqs":
        return (
          <>
            <div className="editor-section-actions">
              <p>El FAQ siempre se renderiza como acordeon desplegable y este boton te permite crear nuevas preguntas editables.</p>
              <button disabled={form.faqs.length >= 10} onClick={addFaqItem} type="button">
                Agregar FAQ
              </button>
            </div>
            <div className="editor-subcard">
              <div className="editor-grid two">
                <label>
                  Chip FAQ
                  <input value={form.uiText.faqChip} onChange={(event) => setUiTextField("faqChip", event.target.value)} />
                </label>
              </div>
              <label>
                Titulo FAQ
                <textarea rows={3} value={form.uiText.faqTitle} onChange={(event) => setUiTextField("faqTitle", event.target.value)} />
              </label>
            </div>
            <div className="editor-stack">
              {form.faqs.map((faq, index) => (
                <div className="editor-subcard" key={`faq-${index}`}>
                  <div className="editor-subcard-head">
                    <strong>FAQ {index + 1}</strong>
                    {renderVisibilityToggle("faqs", index, `faq ${index + 1}`)}
                  </div>
                  <label>
                    Pregunta
                    <input value={faq.question} onChange={(event) => setFaqField(index, "question", event.target.value)} />
                  </label>
                  <label>
                    Respuesta
                    <textarea rows={3} value={faq.answer} onChange={(event) => setFaqField(index, "answer", event.target.value)} />
                  </label>
                </div>
              ))}
            </div>
          </>
        );
      case "contact":
        return (
          <>
            <label>
              Titulo
              <input value={form.contact.title} onChange={(event) => setContactField("title", event.target.value)} />
            </label>
            <label>
              Descripcion
              <textarea rows={3} value={form.contact.description} onChange={(event) => setContactField("description", event.target.value)} />
            </label>
            <label>
              WhatsApp
              <input value={form.contact.whatsappNumber} onChange={(event) => setContactField("whatsappNumber", event.target.value)} />
            </label>
            <label>
              Email
              <input value={form.contact.email} onChange={(event) => setContactField("email", event.target.value)} />
            </label>
          </>
        );
      case "booking":
        return (
          <>
            <div className="editor-section-actions">
              <p>Configura el widget por rubro. Puedes aplicar un preset y luego ajustar copy, formulario y opciones sin tocar codigo.</p>
              <button disabled={form.bookingWidget.options.length >= 8} onClick={addBookingOption} type="button">
                Agregar opcion
              </button>
            </div>
            <div className="editor-grid two">
              <label>
                Rubro
                <select
                  value={form.bookingWidget.preset || detectBookingWidgetPreset(editorProfile, previewContent)}
                  onChange={(event) => applyBookingPreset(event.target.value as NonNullable<SiteContent["bookingWidget"]>["preset"])}
                >
                  {BOOKING_WIDGET_PRESET_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                CTA principal
                <input value={form.bookingWidget.bookingCtaLabel || ""} onChange={(event) => setBookingField("bookingCtaLabel", event.target.value)} />
              </label>
              <label>
                Titulo
                <input value={form.bookingWidget.title || ""} onChange={(event) => setBookingField("title", event.target.value)} />
              </label>
              <label>
                Verbo de accion
                <input value={form.bookingWidget.actionVerb || ""} onChange={(event) => setBookingField("actionVerb", event.target.value)} />
              </label>
              <label>
                Admin label
                <input value={form.bookingWidget.adminLabel || ""} onChange={(event) => setBookingField("adminLabel", event.target.value)} />
              </label>
              <label>
                Admin rol
                <input value={form.bookingWidget.adminRole || ""} onChange={(event) => setBookingField("adminRole", event.target.value)} />
              </label>
              <label>
                Estado
                <input value={form.bookingWidget.adminStatus || ""} onChange={(event) => setBookingField("adminStatus", event.target.value)} />
              </label>
              <label>
                CTA chat
                <input value={form.bookingWidget.chatCtaLabel || ""} onChange={(event) => setBookingField("chatCtaLabel", event.target.value)} />
              </label>
            </div>
            <label>
              Descripcion
              <textarea rows={3} value={form.bookingWidget.description || ""} onChange={(event) => setBookingField("description", event.target.value)} />
            </label>
            <div className="editor-grid two">
              <label>
                Trigger chat
                <input value={form.bookingWidget.triggerChatLabel || ""} onChange={(event) => setBookingField("triggerChatLabel", event.target.value)} />
              </label>
              <label>
                Hint chat
                <input value={form.bookingWidget.triggerChatHint || ""} onChange={(event) => setBookingField("triggerChatHint", event.target.value)} />
              </label>
              <label>
                Trigger accion
                <input value={form.bookingWidget.triggerActionLabel || ""} onChange={(event) => setBookingField("triggerActionLabel", event.target.value)} />
              </label>
              <label>
                Hint accion
                <input value={form.bookingWidget.triggerActionHint || ""} onChange={(event) => setBookingField("triggerActionHint", event.target.value)} />
              </label>
              <label>
                Tab chat
                <input value={form.bookingWidget.tabChatLabel || ""} onChange={(event) => setBookingField("tabChatLabel", event.target.value)} />
              </label>
              <label>
                Tab accion
                <input value={form.bookingWidget.tabActionLabel || ""} onChange={(event) => setBookingField("tabActionLabel", event.target.value)} />
              </label>
              <label>
                CTA WhatsApp
                <input value={form.bookingWidget.directWhatsappLabel || ""} onChange={(event) => setBookingField("directWhatsappLabel", event.target.value)} />
              </label>
              <label>
                Hint WhatsApp
                <input value={form.bookingWidget.directWhatsappHint || ""} onChange={(event) => setBookingField("directWhatsappHint", event.target.value)} />
              </label>
            </div>
            <div className="editor-grid two">
              <label>
                Label resumen
                <input value={form.bookingWidget.summaryLabel || ""} onChange={(event) => setBookingField("summaryLabel", event.target.value)} />
              </label>
              <label>
                Texto resumen
                <input value={form.bookingWidget.summaryText || ""} onChange={(event) => setBookingField("summaryText", event.target.value)} />
              </label>
              <label>
                Label nombre
                <input value={form.bookingWidget.formNameLabel || ""} onChange={(event) => setBookingField("formNameLabel", event.target.value)} />
              </label>
              <label>
                Placeholder nombre
                <input value={form.bookingWidget.formNamePlaceholder || ""} onChange={(event) => setBookingField("formNamePlaceholder", event.target.value)} />
              </label>
              <label>
                Label agenda
                <input value={form.bookingWidget.scheduleLabel || ""} onChange={(event) => setBookingField("scheduleLabel", event.target.value)} />
              </label>
              <label>
                Placeholder agenda
                <input value={form.bookingWidget.schedulePlaceholder || ""} onChange={(event) => setBookingField("schedulePlaceholder", event.target.value)} />
              </label>
              <label>
                Tipo agenda
                <select value={form.bookingWidget.scheduleInputType || "date"} onChange={(event) => setBookingField("scheduleInputType", event.target.value as "date" | "text")}>
                  <option value="date">Fecha</option>
                  <option value="text">Texto libre</option>
                </select>
              </label>
              <label>
                Label cantidad
                <input value={form.bookingWidget.quantityLabel || ""} onChange={(event) => setBookingField("quantityLabel", event.target.value)} />
              </label>
              <label>
                Opciones cantidad
                <input
                  value={(form.bookingWidget.quantityOptions || []).join(", ")}
                  onChange={(event) => setBookingField("quantityOptions", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
                />
              </label>
              <label>
                Label notas
                <input value={form.bookingWidget.notesLabel || ""} onChange={(event) => setBookingField("notesLabel", event.target.value)} />
              </label>
            </div>
            <label>
              Placeholder notas
              <textarea rows={2} value={form.bookingWidget.notesPlaceholder || ""} onChange={(event) => setBookingField("notesPlaceholder", event.target.value)} />
            </label>
            <div className="editor-grid two">
              <label>
                Label seleccion
                <input value={form.bookingWidget.selectionTitle || ""} onChange={(event) => setBookingField("selectionTitle", event.target.value)} />
              </label>
              <label>
                Label detalle
                <input value={form.bookingWidget.detailLabel || ""} onChange={(event) => setBookingField("detailLabel", event.target.value)} />
              </label>
              <label>
                Label precio
                <input value={form.bookingWidget.priceLabel || ""} onChange={(event) => setBookingField("priceLabel", event.target.value)} />
              </label>
              <label>
                Label tiempo
                <input value={form.bookingWidget.timelineLabel || ""} onChange={(event) => setBookingField("timelineLabel", event.target.value)} />
              </label>
            </div>
            <div className="editor-stack">
              {form.bookingWidget.options.map((option, index) => (
                <div className="editor-subcard" key={option.id || `booking-${index}`}>
                  <div className="editor-subcard-head">
                    <strong>Opcion {index + 1}</strong>
                    <button onClick={() => removeBookingOption(index)} type="button">
                      Eliminar
                    </button>
                  </div>
                  <div className="editor-grid two">
                    <label>
                      ID
                      <input value={option.id} onChange={(event) => setBookingOptionField(index, "id", event.target.value)} />
                    </label>
                    <label>
                      Nombre visible
                      <input value={option.label} onChange={(event) => setBookingOptionField(index, "label", event.target.value)} />
                    </label>
                    <label>
                      Detalle
                      <input value={option.roomType} onChange={(event) => setBookingOptionField(index, "roomType", event.target.value)} />
                    </label>
                    <label>
                      Precio
                      <input value={option.price} onChange={(event) => setBookingOptionField(index, "price", event.target.value)} />
                    </label>
                    <label>
                      Subtexto precio
                      <input value={option.rateLabel} onChange={(event) => setBookingOptionField(index, "rateLabel", event.target.value)} />
                    </label>
                    <label>
                      Tiempo o modalidad
                      <input value={option.stayLabel} onChange={(event) => setBookingOptionField(index, "stayLabel", event.target.value)} />
                    </label>
                    <label>
                      Icono
                      <input value={option.emoji || ""} onChange={(event) => setBookingOptionField(index, "emoji", event.target.value)} />
                    </label>
                    <label>
                      Badge
                      <input value={option.badge || ""} onChange={(event) => setBookingOptionField(index, "badge", event.target.value)} />
                    </label>
                  </div>
                  <label>
                    Resumen
                    <textarea rows={2} value={option.summary} onChange={(event) => setBookingOptionField(index, "summary", event.target.value)} />
                  </label>
                  <label>
                    Beneficios
                    <textarea
                      rows={2}
                      value={(option.perks || []).join(", ")}
                      onChange={(event) => setBookingOptionField(index, "perks", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
                    />
                  </label>
                  <label>
                    <input checked={Boolean(option.highlighted)} onChange={(event) => setBookingOptionField(index, "highlighted", event.target.checked)} type="checkbox" />
                    Marcar como destacado
                  </label>
                </div>
              ))}
            </div>
          </>
        );
    }
  }

  return (
    <div className="local-editor-shell">
      <section className="local-editor-preview-stage">
        <div className="local-editor-topbar">
          <div className="local-editor-topbar-copy">
            <span className="eyebrow">Editor local {editorProfile.clientCode}</span>
            <strong>{editorProfile.businessName}</strong>
            <p>{status}</p>
            {supportsHotelPagePreview ? (
              <div className="editor-page-toggle" aria-label="Pagina hotel en preview">
                {HOTEL_NAV_ITEMS.map((item) => (
                  <button className={previewPageSlug === item.slug ? "active" : ""} key={item.slug} onClick={() => handlePreviewPageChange(item.slug)} type="button">
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className={`editor-save-indicator${hasPendingChanges ? " is-dirty" : ""}`}>
              {hasPendingChanges ? "Cambios sin guardar" : "Todo guardado"}
            </div>
          </div>

          <div className="local-editor-topbar-actions">
            <div className="editor-viewport-toggle" aria-label="Modo de preview">
              <button className={viewport === "desktop" ? "active" : ""} onClick={() => setViewport("desktop")} type="button">
                Desktop
              </button>
              <button className={viewport === "tablet" ? "active" : ""} onClick={() => setViewport("tablet")} type="button">
                Tablet
              </button>
              <button className={viewport === "mobile" ? "active" : ""} onClick={() => setViewport("mobile")} type="button">
                Mobile
              </button>
            </div>

            <button className="editor-icon-button editor-sidebar-toggle" onClick={() => setSidebarOpen(true)} type="button">
              Panel
            </button>
          </div>
        </div>

        <div className={`local-editor-preview-shell viewport-${viewport}`} ref={previewShellRef}>
          <SiteRenderer
            content={previewContent}
            editorImageControls={{
              uploadingField,
              onHeroImageChange,
              onGalleryImageChange,
              onServiceImageChange,
              onProductImageChange,
              onTestimonialImageChange,
            }}
            editorItemControls={{
              onRemoveItem: removeEditorItem,
            }}
            editorMode
            editorTextControls={editorTextControls}
            pageSlug={supportsHotelPagePreview ? previewPageSlug : undefined}
            profile={editorProfile}
            referenceSnapshot={referenceSnapshot}
          />
        </div>
      </section>

      <aside className={`local-editor-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="local-editor-sidebar-panel">
          <div className="editor-drawer-header">
            <div>
              <span className="eyebrow">Panel de control</span>
              <strong>{editorProfile.clientCode}</strong>
            </div>
            <button className="editor-icon-button editor-sidebar-close" onClick={() => setSidebarOpen(false)} type="button">
              Cerrar
            </button>
          </div>

          <div className="editor-tab-row">
            <button className={section === "hero" ? "active" : ""} onClick={() => focusEditorSection("hero")} type="button">
              Hero
            </button>
            <button className={section === "story" ? "active" : ""} onClick={() => focusEditorSection("story")} type="button">
              Texto
            </button>
            <button className={section === "services" ? "active" : ""} onClick={() => focusEditorSection("services")} type="button">
              Servicios
            </button>
            <button className={section === "testimonials" ? "active" : ""} onClick={() => focusEditorSection("testimonials")} type="button">
              Testimonios
            </button>
            <button className={section === "faqs" ? "active" : ""} onClick={() => focusEditorSection("faqs")} type="button">
              FAQ
            </button>
            <button className={section === "contact" ? "active" : ""} onClick={() => focusEditorSection("contact")} type="button">
              Contacto
            </button>
            <button className={section === "booking" ? "active" : ""} onClick={() => focusEditorSection("booking")} type="button">
              Booking
            </button>
            <button className={section === "gallery" ? "active" : ""} onClick={() => focusEditorSection("gallery")} type="button">
              Galeria
            </button>
            <button className={section === "visual" ? "active" : ""} onClick={() => focusEditorSection("visual")} type="button">
              Visual
            </button>
            <button className={section === "ai" ? "active" : ""} onClick={() => focusEditorSection("ai")} type="button">
              IA
            </button>
          </div>

          <div className="editor-panel-hint">
            <span>Campo activo</span>
            <strong>{activeField || "Ninguno"}</strong>
          </div>

          <div className="editor-drawer-scroll">{renderSection()}</div>

          <div className="editor-drawer-footer">
            <button className="secondary-button" onClick={openLiveSite} type="button">
              Ver localhost
            </button>
            <button className="secondary-button" disabled={!hasPendingChanges || isSaving} onClick={discardPendingChanges} type="button">
              Descartar
            </button>
            <button className="secondary-button" disabled={isSaving || isApplyingAi || uploadingField !== ""} onClick={handleApplyAiCopy} type="button">
              {isApplyingAi ? "Aplicando IA..." : "Guardar + IA"}
            </button>
            <button className="primary-button" disabled={isSaving || uploadingField !== ""} onClick={handleSave} type="button">
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </aside>

      {!sidebarOpen ? (
        <button className="editor-reopen" onClick={() => setSidebarOpen(true)} type="button">
          Abrir panel
        </button>
      ) : null}
    </div>
  );
}
