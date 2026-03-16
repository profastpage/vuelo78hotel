import "server-only";

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { TemplateSiteConfig } from "@/types/template-site";

const actionSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const positionSchema = z.object({
  x: z.number().min(0).max(100).optional(),
  y: z.number().min(0).max(100).optional(),
});

const siteConfigSchema = z.object({
  template: z.enum(["hotel", "restaurant", "store", "services"]),
  meta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  brand: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    logoSrc: z.string().optional(),
    logoAlt: z.string().optional(),
    whatsapp: z.string().min(1),
    email: z.string().min(1),
    location: z.string().min(1),
  }),
  theme: z.object({
    mode: z.enum(["light", "dark"]),
    accentColor: z.string().min(4),
    accentAltColor: z.string().min(4),
    backgroundColor: z.string().min(4),
    surfaceColor: z.string().min(4),
    textColor: z.string().min(4),
    mutedColor: z.string().min(4),
  }),
  navigation: z.array(
    z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    }),
  ),
  hero: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    primaryCta: actionSchema,
    secondaryCta: actionSchema.optional(),
    benefits: z.array(
      z.object({
        icon: z.string().min(1),
        label: z.string().min(1),
      }),
    ),
    slides: z.array(
      z.object({
        title: z.string().min(1),
        imageSrc: z.string().min(1),
        imageFallbackSrc: z.string().optional(),
        mobileImageSrc: z.string().optional(),
        mobileImageFallbackSrc: z.string().optional(),
        position: positionSchema.optional(),
        mobilePosition: positionSchema.optional(),
      }),
    ).min(1),
  }),
  features: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        icon: z.string().min(1),
      }),
    ).min(1),
  }),
  gallery: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        imageSrc: z.string().min(1),
        imageAlt: z.string().optional(),
      }),
    ).min(1),
  }),
  services: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        meta: z.string().optional(),
        price: z.string().optional(),
        icon: z.string().optional(),
        imageSrc: z.string().optional(),
      }),
    ).min(1),
  }),
  testimonials: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(
      z.object({
        name: z.string().min(1),
        location: z.string().min(1),
        quote: z.string().min(1),
        rating: z.number().min(1).max(5),
        avatarSrc: z.string().optional(),
      }),
    ).min(1),
  }),
  contact: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    whatsappLabel: z.string().min(1),
    whatsappHref: z.string().min(1),
    emailLabel: z.string().min(1),
    address: z.string().min(1),
    hours: z.string().optional(),
    mapEmbedUrl: z.string().optional(),
    socialLinks: z.array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
        icon: z.string().min(1),
      }),
    ).optional(),
  }),
  footer: z.object({
    copyright: z.string().min(1),
    note: z.string().optional(),
  }),
});

const defaultConfigPath = path.join(process.cwd(), "site.json");

export function getTemplateSiteConfigPath() {
  const configuredPath = process.env.SITE_CONFIG_PATH?.trim();
  if (!configuredPath) {
    return defaultConfigPath;
  }

  return path.isAbsolute(configuredPath) ? configuredPath : path.join(process.cwd(), configuredPath);
}

export function hasTemplateSiteConfig() {
  return fs.existsSync(getTemplateSiteConfigPath());
}

export function getTemplateSiteConfig(): TemplateSiteConfig {
  const filePath = getTemplateSiteConfigPath();

  if (!fs.existsSync(filePath)) {
    throw new Error(`Template site configuration not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);

  return siteConfigSchema.parse(parsed);
}
