"use client";

import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import type { ClientProfile, ReferenceSnapshot, SiteContent } from "@/types/site";
import { AgencyEngine } from "./AgencyEngine";
import { BrandSiteEngine } from "./BrandSiteEngine";
import { EditorEntryButton } from "./EditorEntryButton";
import { FloatingReservationWidget } from "./FloatingReservationWidget";
import { LandingEngine } from "./LandingEngine";
import { MobileNav } from "./MobileNav";
import { ReferenceCloneHotelEngine } from "./ReferenceCloneHotelEngine";
import { ReferenceCloneStructuredEngine } from "./ReferenceCloneStructuredEngine";
import { ScrollTopButton } from "./ScrollTopButton";
import { StorefrontEngine } from "./StorefrontEngine";
import { ThemeModeToggle } from "./ThemeModeToggle";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorItemControls } from "./editor-item-types";
import type { EditorTextControls } from "./editor-text-types";
import { resolveBookingWidget } from "@/lib/booking-widget";
import { getEngineKind, getEngineVariant, getLayoutModeClass, getNicheSlug, getShellModeClass, getVisualSignature, getVisualStyleClass } from "./rendering";

type SiteRendererProps = {
  profile: ClientProfile;
  content: SiteContent;
  pageSlug?: string;
  referenceSnapshot?: ReferenceSnapshot | null;
  editorMode?: boolean;
  editorOverlay?: ReactNode;
  editorImageControls?: EditorImageControls;
  editorItemControls?: EditorItemControls;
  editorTextControls?: EditorTextControls;
};

export function SiteRenderer({ profile, content, pageSlug, referenceSnapshot = null, editorMode = false, editorOverlay, editorImageControls, editorItemControls, editorTextControls }: SiteRendererProps) {
  const themeMode = content.theme.mode.toLowerCase() === "light" ? "light" : "dark";
  const activeVisualStyle = content.theme.visualStyle || profile.brandConfig.visualStyle;
  const engine = getEngineKind(profile);
  const variant = getEngineVariant(profile, activeVisualStyle);
  const niche = getNicheSlug(profile.industry);
  const signature = getVisualSignature(profile, activeVisualStyle);
  const styleClass = getVisualStyleClass(activeVisualStyle);
  const layoutModeClass = getLayoutModeClass(content.theme.layoutMode || profile.brandConfig.layoutMode);
  const shellModeClass = getShellModeClass(content.theme.shellMode || profile.brandConfig.shellMode);
  const textAlignClass = content.theme.textAlign === "left" ? "content-align-left" : "content-align-center";
  const buttonShapeClass = content.theme.buttonShape === "square" ? "button-shape-square" : "button-shape-rounded";
  const isDevelopment = process.env.NODE_ENV === "development";
  const referenceSource = [
    profile.industry,
    profile.businessName,
    profile.brandConfig.businessDescription,
    content.brand.heroTag,
    content.brand.headline,
    content.brand.description,
    content.narrative.goal,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const isHospitalityTheme =
    /(hotel|hoteler|hostal|hostel|resort|alojamiento|hosped|habitacion|suite|room|turismo|hospitality)/i.test(referenceSource) ||
    content.bookingWidget?.preset === "hotel";
  const isReferenceHotelClone = isHospitalityTheme;
  const hasReferenceSnapshot = Boolean(profile.reference?.enabled && referenceSnapshot?.sections?.length);
  const referenceCloneMode = isReferenceHotelClone ? "hotel" : hasReferenceSnapshot ? "structured" : "";
  const accentContrast = getContrastingTextColor(content.theme.accentColor);
  const accentAltContrast = getContrastingTextColor(content.theme.accentAltColor);
  const surfaceText = themeMode === "light" ? "#111827" : "#F7F5EF";
  const resolvedBookingWidget = resolveBookingWidget(content, profile);
  const hasBookingWidget = Boolean(profile.modules?.booking && content.bookingWidget && resolvedBookingWidget.options?.length);
  const pageStyle = {
    "--accent": content.theme.accentColor,
    "--accent-alt": content.theme.accentAltColor,
    "--accent-contrast": accentContrast,
    "--accent-alt-contrast": accentAltContrast,
    "--surface-contrast": surfaceText,
  } as CSSProperties;

  return (
    <main
      className={`page-shell theme-${themeMode} engine-${engine} variant-${variant} niche-${niche} ${signature} ${styleClass} ${layoutModeClass} ${shellModeClass} ${textAlignClass} ${buttonShapeClass}${editorMode ? " editor-preview-mode" : " with-mobile-nav"}${isDevelopment && !editorMode ? " has-local-editor" : ""}${referenceCloneMode ? ` mode-reference-clone-${referenceCloneMode}` : ""}`}
      style={pageStyle}
    >
      {!referenceCloneMode ? <div className="atmo atmo-a" /> : null}
      {!referenceCloneMode ? <div className="atmo atmo-b" /> : null}
      {!referenceCloneMode ? <div className="atmo-grid" /> : null}

      {!editorMode && !referenceCloneMode ? (
        <MobileNav
          brandName={content.brand.name}
          pages={content.pages}
          primaryCtaHref={content.brand.primaryCtaHref}
          primaryCtaLabel={content.brand.primaryCtaLabel}
          secondaryCtaHref={content.brand.secondaryCtaHref}
          secondaryCtaLabel={content.brand.secondaryCtaLabel}
        />
      ) : null}

      {isDevelopment && !editorMode ? <EditorEntryButton /> : null}

      {hasBookingWidget ? (
        <div data-editor-section="booking">
          <FloatingReservationWidget content={content} isLocalEnvironment={isDevelopment || editorMode} />
        </div>
      ) : null}
      {!editorMode ? <ScrollTopButton /> : null}
      <ThemeModeToggle editorMode={editorMode} />

      {referenceCloneMode === "hotel" ? (
        <ReferenceCloneHotelEngine
          content={content}
          editorImageControls={editorImageControls}
          editorMode={editorMode}
          editorTextControls={editorTextControls}
          pageSlug={pageSlug}
          profile={profile}
        />
      ) : null}
      {referenceCloneMode === "structured" && referenceSnapshot ? (
        <ReferenceCloneStructuredEngine
          content={content}
          editorImageControls={editorImageControls}
          editorMode={editorMode}
          editorTextControls={editorTextControls}
          profile={profile}
          snapshot={referenceSnapshot}
        />
      ) : null}
      {!referenceCloneMode && engine === "landing" ? (
        <LandingEngine
          content={content}
          editorImageControls={editorImageControls}
          editorMode={editorMode}
          editorTextControls={editorTextControls}
          profile={profile}
        />
      ) : null}
      {!referenceCloneMode && engine === "brand" ? <BrandSiteEngine content={content} editorImageControls={editorImageControls} editorMode={editorMode} editorTextControls={editorTextControls} profile={profile} /> : null}
      {!referenceCloneMode && engine === "agency" ? <AgencyEngine content={content} editorImageControls={editorImageControls} editorMode={editorMode} editorTextControls={editorTextControls} profile={profile} /> : null}
      {!referenceCloneMode && engine === "storefront" ? <StorefrontEngine content={content} editorImageControls={editorImageControls} editorItemControls={editorItemControls} editorMode={editorMode} editorTextControls={editorTextControls} profile={profile} /> : null}
      {editorOverlay}
    </main>
  );
}

function getContrastingTextColor(hex: string) {
  const normalized = (hex || "").trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "#111827";
  }

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance >= 150 ? "#111827" : "#F8FAFC";
}
