import type { Metadata } from "next";
import { TemplatePageEngine } from "@/components/templates/TemplatePageEngine";
import { getTemplateSiteConfig } from "@/lib/template-site-config";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const config = getTemplateSiteConfig();

  return {
    title: config.meta.title,
    description: config.meta.description,
  };
}

export default function HomePage() {
  const config = getTemplateSiteConfig();

  return <TemplatePageEngine config={config} />;
}
