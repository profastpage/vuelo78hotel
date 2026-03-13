import type { ClientProfile, SiteContent } from "@/types/site";
import type { EditorImageControls } from "./editor-image-types";
import type { EditorTextControls } from "./editor-text-types";
import { ProfessionalWebsiteEngine } from "./ProfessionalWebsiteEngine";

type AgencyEngineProps = {
  profile: ClientProfile;
  content: SiteContent;
  editorMode?: boolean;
  editorImageControls?: EditorImageControls;
  editorTextControls?: EditorTextControls;
};

export function AgencyEngine(props: AgencyEngineProps) {
  return <ProfessionalWebsiteEngine {...props} siteKind="agency" />;
}
