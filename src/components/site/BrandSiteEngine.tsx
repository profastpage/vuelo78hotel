import type { ClientProfile, SiteContent } from "@/types/site";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { ProfessionalWebsiteEngine } from "./ProfessionalWebsiteEngine";

type BrandSiteEngineProps = {
  profile: ClientProfile;
  content: SiteContent;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorTextControls?: EditorTextControls;
};

export function BrandSiteEngine(props: BrandSiteEngineProps) {
  return <ProfessionalWebsiteEngine {...props} siteKind="brand" />;
}
