import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import YAML from "yaml";
import { z } from "zod";
import { buildClientProfileFromBrief, buildSiteContentFromBrief, getWebsiteBrief } from "@/lib/brief-generator";
import { readConfigJson } from "@/lib/local-editor-storage";
import type { BriefData, ClientProfile, SiteContent } from "@/types/site";

const execFileAsync = promisify(execFile);

const aiRequestSchema = z.object({
  action: z.enum(["organize", "apply"]),
  rawText: z.string().trim().min(20).max(16000),
  businessName: z.string().trim().max(120).optional(),
  projectType: z.string().trim().max(80).optional(),
  industry: z.string().trim().max(80).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  email: z.string().trim().max(120).optional(),
});

type RawWorkflowModule = {
  extractBriefFromRaw: (rawText: string) => BriefData;
  buildOrderedRawFromBrief: (brief: BriefData) => string;
};

function editorEnabled() {
  return process.env.NODE_ENV === "development" || process.env.ALLOW_LOCAL_EDITOR === "true";
}

function normalizeProjectTypeHint(value?: string) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "landing page") {
    return "Landing Page";
  }

  if (normalized === "e-commerce" || normalized === "ecommerce") {
    return "E-commerce";
  }

  if (normalized === "web site" || normalized === "website") {
    return "Website";
  }

  return "";
}

function enrichRawInput(rawText: string, payload: z.infer<typeof aiRequestSchema>) {
  const source = rawText.trim();
  const headerLines = [
    payload.businessName ? `Business name: ${payload.businessName}` : "",
    normalizeProjectTypeHint(payload.projectType) ? `Project type: ${normalizeProjectTypeHint(payload.projectType)}` : "",
    payload.industry ? `Industry: ${payload.industry}` : "",
    payload.whatsapp ? `WhatsApp: ${payload.whatsapp}` : "",
    payload.email ? `Email: ${payload.email}` : "",
  ].filter(Boolean);

  const existingHasHeader = /(business name|project type|industry|whatsapp|email)\s*:/i.test(source);
  if (existingHasHeader || headerLines.length === 0) {
    return source;
  }

  return `${headerLines.join("\n")}\n\n${source}`;
}

async function loadRawWorkflowModule() {
  const moduleUrl = pathToFileURL(path.join(process.cwd(), "scripts", "lib", "raw-to-brief.mjs")).href;
  return import(moduleUrl) as Promise<RawWorkflowModule>;
}

function preserveImageItems<T extends { imageSrc?: string; imagePosition?: unknown }>(generated: T[], existing: T[] | undefined) {
  return generated.map((item, index) => ({
    ...item,
    imageSrc: existing?.[index]?.imageSrc || item.imageSrc || "",
    imagePosition: existing?.[index]?.imagePosition ?? item.imagePosition,
  }));
}

function preserveTestimonials(
  generated: SiteContent["testimonials"],
  existing: SiteContent["testimonials"] | undefined,
) {
  return generated.map((item, index) => ({
    ...item,
    avatarSrc: existing?.[index]?.avatarSrc || item.avatarSrc || "",
    location: item.location || existing?.[index]?.location || "",
    segment: item.segment || existing?.[index]?.segment || "",
    rating: existing?.[index]?.rating || item.rating || 5,
  }));
}

async function readFileSnapshot(filePath: string) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

function mergeGeneratedContent(existing: SiteContent, generated: SiteContent): SiteContent {
  return {
    ...generated,
    brand: {
      ...generated.brand,
      name: existing.brand?.name || generated.brand.name,
      heroImageSrc: existing.brand?.heroImageSrc || generated.brand.heroImageSrc || "",
      heroImagePosition: existing.brand?.heroImagePosition ?? generated.brand.heroImagePosition,
    },
    theme: existing.theme && Object.keys(existing.theme).length > 0 ? existing.theme : generated.theme,
    visibility: existing.visibility ?? generated.visibility,
    services: preserveImageItems(generated.services, existing.services),
    products: preserveImageItems(generated.products, existing.products),
    testimonials: preserveTestimonials(generated.testimonials, existing.testimonials),
    galleryItems: existing.galleryItems && existing.galleryItems.length > 0 ? existing.galleryItems : generated.galleryItems,
    pricing: existing.pricing ?? generated.pricing,
    team: existing.team ?? generated.team,
    timeline: existing.timeline ?? generated.timeline,
    location: {
      address: generated.location?.address || existing.location?.address || "",
      ...generated.location,
      mapsEmbedUrl: existing.location?.mapsEmbedUrl || generated.location?.mapsEmbedUrl || "",
      mapsLink: existing.location?.mapsLink || generated.location?.mapsLink || "",
      hours: existing.location?.hours || generated.location?.hours || "",
    },
  };
}

function mergeGeneratedProfile(existing: ClientProfile, generated: ClientProfile, brief: BriefData): ClientProfile {
  return {
    ...existing,
    businessName: existing.businessName || brief.businessName,
    projectType: existing.projectType || generated.projectType,
    industry: existing.industry || brief.industry,
    modules: existing.modules && Object.keys(existing.modules).length > 0 ? existing.modules : generated.modules,
    brandConfig: {
      ...(existing.brandConfig || {}),
      businessDescription: generated.brandConfig.businessDescription,
      offerSummary: generated.brandConfig.offerSummary,
      primaryGoal: generated.brandConfig.primaryGoal,
      specialty: generated.brandConfig.specialty,
      copyStyle: generated.brandConfig.copyStyle,
      whatsappNumber: existing.brandConfig?.whatsappNumber || generated.brandConfig.whatsappNumber,
      email: existing.brandConfig?.email || generated.brandConfig.email,
      themeMode: existing.brandConfig?.themeMode || generated.brandConfig.themeMode,
      visualStyle: existing.brandConfig?.visualStyle || generated.brandConfig.visualStyle,
      layoutMode: existing.brandConfig?.layoutMode || generated.brandConfig.layoutMode,
      shellMode: existing.brandConfig?.shellMode || generated.brandConfig.shellMode,
      textAlign: existing.brandConfig?.textAlign || generated.brandConfig.textAlign,
      buttonShape: existing.brandConfig?.buttonShape || generated.brandConfig.buttonShape,
      visualConcept: existing.brandConfig?.visualConcept || generated.brandConfig.visualConcept,
      layoutMood: existing.brandConfig?.layoutMood || generated.brandConfig.layoutMood,
      visualSignature: existing.brandConfig?.visualSignature || generated.brandConfig.visualSignature,
      accentColor: existing.brandConfig?.accentColor || generated.brandConfig.accentColor,
      accentAltColor: existing.brandConfig?.accentAltColor || generated.brandConfig.accentAltColor,
    },
  };
}

function getCursorCommandCandidates() {
  if (process.env.CURSOR_AGENT_COMMAND?.trim()) {
    return [process.env.CURSOR_AGENT_COMMAND.trim()];
  }

  return ["cursor-agent", "cursor.cmd", "cursor"];
}

function getCodexCommand() {
  const customCommand = process.env.CODEX_COMMAND?.trim();
  if (customCommand) {
    return customCommand;
  }

  return "codex.exe";
}

async function tryRunCursorRefinement() {
  const promptPath = path.join(process.cwd(), "ai", "prompt-web-generator.md");
  const briefPath = path.join(process.cwd(), "content", "brief.yaml");
  let workflowPrompt = "";

  try {
    workflowPrompt = await fs.readFile(promptPath, "utf8");
  } catch {
    return "Cursor Agent no disponible para refinar.";
  }

  const prompt = [
    "Refine only content/brief.yaml for this project.",
    "Read and follow:",
    "- AGENTS.md",
    "- ai/prompt-web-generator.md",
    "- content/raw.txt",
    "- content/brief.yaml",
    "",
    "Requirements:",
    "- Improve hero headline and subtitle so they feel more unique, premium, and commercially sharp.",
    "- Improve FAQ questions and answers so they feel credible, concise, and objection-driven.",
    "- Improve testimonials so they sound specific, natural, and trust-building instead of generic.",
    "- Even if the factual structure already matches content/raw.txt, still sharpen the wording and section framing.",
    "- Keep facts aligned with content/raw.txt.",
    "- Do not redesign components or modify layout files.",
    "- Update only content/brief.yaml.",
    "",
    workflowPrompt,
  ].join("\n");
  const beforeSnapshot = await readFileSnapshot(briefPath);

  for (const command of getCursorCommandCandidates()) {
    const args = command.startsWith("cursor-agent")
      ? ["-p", "--force", "--output-format", "text", prompt]
      : ["agent", "-p", "--force", "--output-format", "text", prompt];

    try {
      await execFileAsync(command, args, {
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 8,
      });
      const afterSnapshot = await readFileSnapshot(briefPath);
      if (afterSnapshot && afterSnapshot !== beforeSnapshot) {
        return "Cursor Agent mejoro el brief automaticamente.";
      }

      return "Cursor Agent se ejecuto, pero no cambio el brief.";
    } catch {
      continue;
    }
  }

  return "Cursor Agent no estuvo disponible; se conserva el generador local pro.";
}

async function tryRunCodexRefinement() {
  const promptPath = path.join(process.cwd(), "ai", "prompt-web-generator.md");
  const briefPath = path.join(process.cwd(), "content", "brief.yaml");
  let workflowPrompt = "";

  try {
    workflowPrompt = await fs.readFile(promptPath, "utf8");
  } catch {
    return "Codex no disponible para refinar.";
  }

  const prompt = [
    "Update only content/brief.yaml for this project.",
    "Read and follow:",
    "- AGENTS.md",
    "- ai/prompt-web-generator.md",
    "- content/raw.txt",
    "- content/brief.yaml",
    "",
    "Requirements:",
    "- Preserve the current visual style, theme, colors, layout, and architecture.",
    "- Improve hero headline and subtitle so they feel more original, premium, and commercially sharp.",
    "- Improve FAQ questions and answers so they feel concise, credible, and objection-driven.",
    "- Improve testimonials so they feel specific, believable, and results-aware.",
    "- Improve section titles and CTA wording with stronger copy.",
    "- Even if the factual structure already matches content/raw.txt, still sharpen the copy and section framing.",
    "- Update only content/brief.yaml.",
    "",
    workflowPrompt,
  ].join("\n");
  const beforeSnapshot = await readFileSnapshot(briefPath);

  try {
    await execFileAsync(
      getCodexCommand(),
      [
        "exec",
        "--skip-git-repo-check",
        "--dangerously-bypass-approvals-and-sandbox",
        "-C",
        process.cwd(),
        prompt,
      ],
      {
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 8,
      },
    );
    const afterSnapshot = await readFileSnapshot(briefPath);
    if (afterSnapshot && afterSnapshot !== beforeSnapshot) {
      return "OpenAI Codex mejoro el brief automaticamente.";
    }

    return "OpenAI Codex se ejecuto, pero no cambio el brief.";
  } catch {
    return "Codex no estuvo disponible; se conserva el brief refinado localmente.";
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!editorEnabled()) {
    return NextResponse.json({ ok: false, message: "Editor local deshabilitado." }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Body JSON invalido." }, { status: 400 });
  }

  const parsed = aiRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Solicitud AI invalida.", fields: parsed.error.flatten() }, { status: 400 });
  }

  const rawWorkflow = await loadRawWorkflowModule();
  const hintedRaw = enrichRawInput(parsed.data.rawText, parsed.data);
  const brief = rawWorkflow.extractBriefFromRaw(hintedRaw);
  const organizedRaw = rawWorkflow.buildOrderedRawFromBrief(brief);

  if (parsed.data.action === "organize") {
    return NextResponse.json({
      ok: true,
      message: "Datos ordenados segun el tipo de proyecto. Revisa el bloque y luego usa Guardar + IA.",
      rawText: organizedRaw,
    });
  }

  const configDir = path.join(process.cwd(), "config");
  const contentDir = path.join(process.cwd(), "content");
  const profilePath = path.join(configDir, "client-profile.json");
  const siteContentPath = path.join(configDir, "site-content.json");
  const localEditorPath = path.join(configDir, "local-editor-content.json");
  const rawPath = path.join(contentDir, "raw.txt");
  const briefPath = path.join(contentDir, "brief.yaml");

  await fs.mkdir(configDir, { recursive: true });
  await fs.mkdir(contentDir, { recursive: true });
  await fs.writeFile(rawPath, organizedRaw, "utf8");
  await fs.writeFile(
    briefPath,
    YAML.stringify(brief, {
      lineWidth: 0,
      minContentWidth: 0,
    }),
    "utf8",
  );

  const cursorStatus = await tryRunCursorRefinement();
  const codexStatus = await tryRunCodexRefinement();
  const finalBrief = getWebsiteBrief() ?? brief;
  const existingProfile = readConfigJson<ClientProfile>("client-profile.json", {} as ClientProfile);
  const existingContent = readConfigJson<SiteContent>("site-content.json", {} as SiteContent);
  const generatedProfile = buildClientProfileFromBrief(finalBrief);
  const generatedContent = buildSiteContentFromBrief(finalBrief);
  const nextProfile = mergeGeneratedProfile(existingProfile, generatedProfile, finalBrief);
  const nextContent = mergeGeneratedContent(existingContent, generatedContent);

  await Promise.all([
    fs.writeFile(profilePath, `${JSON.stringify(nextProfile, null, 2)}\n`, "utf8"),
    fs.writeFile(siteContentPath, `${JSON.stringify(nextContent, null, 2)}\n`, "utf8"),
    fs.writeFile(localEditorPath, "{}\n", "utf8"),
    fs.writeFile(
      briefPath,
      YAML.stringify(finalBrief, {
        lineWidth: 0,
        minContentWidth: 0,
      }),
      "utf8",
    ),
  ]);

  return NextResponse.json({
    ok: true,
    message: "Copy pro aplicado al proyecto. Se actualizaron textos y descripciones preservando tema, colores y estructura visual.",
    rawText: organizedRaw,
    content: nextContent,
    cursorStatus,
    codexStatus,
  });
}
