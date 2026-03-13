import { SiteRenderer } from "@/components/site/SiteRenderer";
import { getClientProfile, getSiteContent } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const profile = getClientProfile();
  const content = getSiteContent();

  return <SiteRenderer content={content} profile={profile} />;
}
