import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { isHotelPageSlug } from "@/lib/hotel-pages";
import { getClientProfile, getSiteContent } from "@/lib/site-config";

type HotelPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [
    { slug: "ofertas" },
    { slug: "experiencias" },
    { slug: "habitaciones" },
    { slug: "servicios" },
    { slug: "restaurante" },
    { slug: "eventos" },
    { slug: "galeria" },
    { slug: "mapa" },
  ];
}

export default async function HotelSectionPage({ params }: HotelPageProps) {
  const { slug } = await params;

  if (!isHotelPageSlug(slug) || slug === "hotel") {
    notFound();
  }

  const profile = getClientProfile();
  const content = getSiteContent();

  return <SiteRenderer content={content} pageSlug={slug} profile={profile} />;
}
