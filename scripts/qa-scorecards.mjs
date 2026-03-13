import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profilePath = path.join(root, "config", "client-profile.json");
const siteContentPath = path.join(root, "config", "site-content.json");
const briefPath = path.join(root, "content", "brief.yaml");
const starterKitsPath = path.join(root, "config", "starter-kits.json");
const outDir = path.join(root, ".qa-output");
const outPath = path.join(outDir, "scorecards-latest.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function inferScreenType(profile) {
  const projectType = String(profile.projectType || "").toLowerCase();
  if (projectType === "landing page") {
    return "landing";
  }
  if (projectType === "e-commerce") {
    return "storefront";
  }
  if (profile.modules?.auth || profile.modules?.multiTenant || profile.modules?.payments) {
    return "operational-app";
  }
  return "brand-site";
}

function scoreVisual(profile, siteContent, briefText) {
  let score = 58;
  if (siteContent.theme?.visualStyle) score += 10;
  if (siteContent.theme?.layoutMode) score += 6;
  if (siteContent.theme?.shellMode) score += 6;
  if (profile.brandConfig?.visualSignature) score += 6;
  if (profile.brandConfig?.visualConcept) score += 6;
  if (profile.brandConfig?.starterKit) score += 6;
  if (/Premium strategy:/i.test(briefText)) score += 8;
  return clamp(score);
}

function scoreConversion(profile, siteContent) {
  let score = 54;
  if (siteContent.brand?.primaryCtaLabel) score += 10;
  if (siteContent.brand?.secondaryCtaLabel) score += 6;
  if (siteContent.contact?.title) score += 5;
  if ((siteContent.highlights || []).length >= 3) score += 8;
  if ((siteContent.faqs || []).length >= 3) score += 8;
  if ((siteContent.testimonials || []).length >= 3) score += 9;
  if (profile.modules?.leadForm || profile.modules?.whatsappCTA || profile.modules?.booking) score += 8;
  return clamp(score);
}

function scoreTrust(profile, siteContent) {
  let score = 56;
  if ((siteContent.testimonials || []).length >= 3) score += 12;
  if ((siteContent.faqs || []).length >= 3) score += 8;
  if (siteContent.contact?.email) score += 6;
  if (siteContent.contact?.whatsappNumber) score += 6;
  if (siteContent.location?.address) score += 6;
  if ((siteContent.team?.members || []).length >= 2) score += 8;
  if ((siteContent.timeline?.items || []).length >= 3) score += 6;
  return clamp(score);
}

function scoreResponsive(siteContent) {
  let score = 70;
  if (siteContent.theme?.layoutMode) score += 8;
  if (siteContent.theme?.shellMode) score += 8;
  if ((siteContent.services || []).length >= 3) score += 4;
  if ((siteContent.pages || []).length >= 5) score += 4;
  if (siteContent.brand?.headline && siteContent.brand.headline.trim().split(/\s+/).length <= 12) score += 6;
  return clamp(score);
}

function scoreContent(siteContent, briefText) {
  let score = 58;
  if (siteContent.brand?.headline) score += 8;
  if (siteContent.brand?.subheadline) score += 8;
  if ((siteContent.services || []).length >= 3) score += 7;
  if ((siteContent.highlights || []).length >= 3) score += 6;
  if ((siteContent.faqs || []).length >= 3) score += 6;
  if ((siteContent.testimonials || []).length >= 3) score += 6;
  if (/Design system starter:/i.test(briefText)) score += 7;
  return clamp(score);
}

function buildFocusAreas(scores) {
  return Object.entries(scores)
    .filter(([, value]) => value < 85)
    .sort((a, b) => a[1] - b[1])
    .map(([key, value]) => ({
      area: key,
      score: value,
      note: getImprovementNote(key),
    }));
}

function getImprovementNote(key) {
  switch (key) {
    case "visual":
      return "Reforzar direccion visual, firma de pantalla y coherencia del starter kit.";
    case "conversion":
      return "Reforzar promesa, CTA, prueba social y claridad del siguiente paso.";
    case "trust":
      return "Aumentar senales de confianza: equipo, testimonios, FAQ, contacto y ubicacion.";
    case "responsive":
      return "Revisar densidad, stacking mobile y estabilidad del layout.";
    case "content":
      return "Mejorar headline, subtitulos, FAQ y bloques de valor.";
    default:
      return "Mejorar la calidad general del sistema.";
  }
}

function main() {
  const profile = readJson(profilePath);
  const siteContent = readJson(siteContentPath);
  const starterKits = readJson(starterKitsPath);
  const briefText = readText(briefPath);
  const screenType = inferScreenType(profile);
  const scores = {
    visual: scoreVisual(profile, siteContent, briefText),
    conversion: scoreConversion(profile, siteContent),
    trust: scoreTrust(profile, siteContent),
    responsive: scoreResponsive(siteContent),
    content: scoreContent(siteContent, briefText),
  };

  const activeStarterKit =
    starterKits.kits?.find((kit) => kit.key === profile.brandConfig?.starterKit) ||
    starterKits.kits?.find((kit) => kit.key === siteContent.theme?.starterKit) ||
    null;
  const summary = {
    generatedAt: new Date().toISOString(),
    project: profile.businessName,
    screenType,
    starterKit: activeStarterKit ? { key: activeStarterKit.key, label: activeStarterKit.label } : null,
    scores,
    average: clamp((scores.visual + scores.conversion + scores.trust + scores.responsive + scores.content) / 5),
    focusAreas: buildFocusAreas(scores),
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("Scorecards QA generated.");
  console.log(`- Screen type: ${summary.screenType}`);
  console.log(`- Starter kit: ${summary.starterKit?.label || "none"}`);
  console.log(`- Average: ${summary.average}`);
  for (const [key, value] of Object.entries(summary.scores)) {
    console.log(`- ${key}: ${value}`);
  }
  if (summary.focusAreas.length > 0) {
    console.log("- Focus:");
    for (const item of summary.focusAreas) {
      console.log(`  - ${item.area}: ${item.note}`);
    }
  }
  console.log(`- Report: ${path.relative(root, outPath)}`);
}

main();
