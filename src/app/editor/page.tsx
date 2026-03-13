import { LocalEditor } from "@/components/site/LocalEditor";
import { getClientProfile, getRawBusinessInput, getReferenceSnapshot, getSiteContent } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default function EditorPage() {
  const profile = getClientProfile();
  const content = getSiteContent();
  const rawInput = getRawBusinessInput();
  const referenceSnapshot = getReferenceSnapshot();

  return <LocalEditor content={content} profile={profile} rawInput={rawInput} referenceSnapshot={referenceSnapshot} />;
}
