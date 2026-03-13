import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import type { SiteContent } from "@/types/site";

export type LocalEditorMeta = {
  storageVersion?: number;
  clientCode?: string;
  businessName?: string;
  baseFingerprint?: string;
  updatedAt?: string;
};

export type StoredLocalEditorContent = Partial<SiteContent> & {
  __meta?: LocalEditorMeta;
};

type LocalEditorContext = {
  clientCode?: string;
  businessName?: string;
  brandName?: string;
  baseFingerprint?: string;
};

function getConfigPath(fileName: string) {
  return path.join(process.cwd(), "config", fileName);
}

function normalizeIdentity(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readConfigJson<T>(fileName: string, fallback: T): T {
  const filePath = getConfigPath(fileName);
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getBaseSiteContentFingerprint() {
  const filePath = getConfigPath("site-content.json");
  const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "{}";
  return createHash("sha1").update(raw).digest("hex");
}

export function getLocalEditorContext(): LocalEditorContext {
  const profile = readConfigJson<{ clientCode?: string; businessName?: string }>("client-profile.json", {});
  const siteContent = readConfigJson<Partial<SiteContent>>("site-content.json", {});

  return {
    clientCode: profile.clientCode,
    businessName: profile.businessName,
    brandName: siteContent.brand?.name,
    baseFingerprint: getBaseSiteContentFingerprint(),
  };
}

export function stripLocalEditorMeta<T extends StoredLocalEditorContent>(value: T): Partial<SiteContent> {
  const { __meta: _meta, ...content } = value;
  return content;
}

export function attachLocalEditorMeta(content: Partial<SiteContent>, context: LocalEditorContext): StoredLocalEditorContent {
  return {
    __meta: {
      storageVersion: 2,
      clientCode: context.clientCode,
      businessName: context.businessName || context.brandName,
      baseFingerprint: context.baseFingerprint,
      updatedAt: new Date().toISOString(),
    },
    ...content,
  };
}

export function looksLikeLegacyLocalEditorSnapshot(value: StoredLocalEditorContent) {
  const content = stripLocalEditorMeta(value);
  const keys = Object.keys(content);
  const snapshotKeys = ["brand", "narrative", "theme", "uiText", "contact", "bookingWidget", "highlights", "galleryItems", "services", "products", "testimonials", "faqs"];
  const matchedKeys = snapshotKeys.filter((key) => keys.includes(key));
  return matchedKeys.length >= 6;
}

function buildPatch(base: unknown, next: unknown): unknown {
  if (Array.isArray(base) || Array.isArray(next)) {
    return JSON.stringify(base ?? null) === JSON.stringify(next ?? null) ? undefined : next;
  }

  if (isPlainObject(base) && isPlainObject(next)) {
    const patch: Record<string, unknown> = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(next)]);

    for (const key of keys) {
      const value = buildPatch(base[key], next[key]);
      if (value !== undefined) {
        patch[key] = value;
      }
    }

    return Object.keys(patch).length > 0 ? patch : undefined;
  }

  return Object.is(base, next) ? undefined : next;
}

export function buildLocalEditorPatch(base: Partial<SiteContent>, next: Partial<SiteContent>) {
  return (buildPatch(base, next) ?? {}) as Partial<SiteContent>;
}

export function isLocalEditorContentCompatible(value: StoredLocalEditorContent, context: LocalEditorContext) {
  const meta = value.__meta;
  const expectedNames = new Set(
    [context.businessName, context.brandName].map(normalizeIdentity).filter(Boolean),
  );

  if (meta?.clientCode && context.clientCode && meta.clientCode !== context.clientCode) {
    return false;
  }

  if (meta?.businessName && expectedNames.size > 0 && !expectedNames.has(normalizeIdentity(meta.businessName))) {
    return false;
  }

  if (meta?.storageVersion && meta.storageVersion >= 2) {
    return true;
  }

  if (meta?.baseFingerprint && context.baseFingerprint && meta.baseFingerprint !== context.baseFingerprint) {
    return false;
  }

  const legacyBrandName = value.brand?.name;
  if (!meta && looksLikeLegacyLocalEditorSnapshot(value)) {
    return false;
  }

  if (!meta && typeof legacyBrandName === "string" && expectedNames.size > 0 && !expectedNames.has(normalizeIdentity(legacyBrandName))) {
    return false;
  }

  return true;
}

export function getCompatibleLocalEditorContent(value: StoredLocalEditorContent, context: LocalEditorContext) {
  if (!isLocalEditorContentCompatible(value, context)) {
    return {};
  }

  return stripLocalEditorMeta(value);
}
