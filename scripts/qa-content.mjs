import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const findings = [];
const isTemplateProject = path.basename(root) === "_TEMPLATE_CODEX_REPO";

const encodingPatterns = [
  { token: "Ãƒ", reason: "possible broken UTF-8 sequence" },
  { token: "Ã¢â‚¬", reason: "broken quote or chevron sequence" },
  { token: "Ã¢Ëœ", reason: "broken symbol sequence" },
  { token: "ï¿½", reason: "replacement character found" },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8").replace(/^\uFEFF/, ""));
}

function addFinding(message) {
  findings.push(message);
}

function walkFiles(startPath, allowedExtensions, result = []) {
  if (!fs.existsSync(startPath)) {
    return result;
  }

  for (const entry of fs.readdirSync(startPath, { withFileTypes: true })) {
    const fullPath = path.join(startPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, allowedExtensions, result);
      continue;
    }

    if (allowedExtensions.has(path.extname(entry.name))) {
      result.push(fullPath);
    }
  }

  return result;
}

const clientProfile = readJson("config/client-profile.json");
const siteContent = readJson("config/site-content.json");
const visualPresets = readJson("config/visual-presets.json");
const starterKits = readJson("config/starter-kits.json");
const validVisualStyles = new Set(visualPresets.visualStyles.map((item) => item.key));
const validLayoutModes = new Set(visualPresets.layoutModes.map((item) => item.key));
const validStarterKits = new Set((starterKits.kits || []).map((item) => item.key));

function normalizeVisualStyle(value) {
  const style = String(value || "").trim().toLowerCase();

  switch (style) {
    case "bento":
      return "bento";
    case "editorial":
      return "editorial";
    case "immersive":
      return "immersive";
    case "saas modern ui":
    case "saas-modern-ui":
      return "saas-modern-ui";
    case "glassmorphism":
      return "glassmorphism";
    case "minimal business":
    case "minimal-business":
      return "minimal-business";
    case "web visual con imagenes grandes":
    case "web visual con imágenes grandes":
    case "web-visual-imagenes-grandes":
      return "web-visual-imagenes-grandes";
    case "interactive motion ui":
    case "interactive motion ui (ultra moderno)":
    case "interactive-motion-ui":
      return "interactive-motion-ui";
    case "elegante":
      return "luxury";
    default:
      return style;
  }
}

const styleCandidate = normalizeVisualStyle(siteContent.theme?.visualStyle || clientProfile.brandConfig?.visualStyle || "");
const layoutModeCandidate = String(siteContent.theme?.layoutMode || clientProfile.brandConfig?.layoutMode || "soft").trim().toLowerCase();

if (!isTemplateProject && !validVisualStyles.has(styleCandidate) && !["auto"].includes(styleCandidate)) {
  addFinding(`Unsupported visual style "${styleCandidate}" in config/site-content.json`);
}

if (!validLayoutModes.has(layoutModeCandidate)) {
  addFinding(`Unsupported layout mode "${layoutModeCandidate}" in config/site-content.json`);
}

const starterKitCandidate = String(clientProfile.brandConfig?.starterKit || "").trim();
if (starterKitCandidate && !validStarterKits.has(starterKitCandidate)) {
  addFinding(`Unsupported starter kit "${starterKitCandidate}" in config/client-profile.json`);
}

const placeholderPatterns = [
  "REEMPLAZAR",
  "Lorem ipsum",
  "placeholder",
  "TODO",
];

const filesToScan = [
  path.join(root, "config", "client-profile.json"),
  path.join(root, "config", "site-content.json"),
];

for (const filePath of filesToScan) {
  const content = fs.readFileSync(filePath, "utf8");

  for (const marker of placeholderPatterns) {
    if (!isTemplateProject && content.includes(marker)) {
      addFinding(`${path.relative(root, filePath).replace(/\\/g, "/")} contains placeholder marker "${marker}"`);
    }
  }

  for (const pattern of encodingPatterns) {
    if (content.includes(pattern.token)) {
      addFinding(`${path.relative(root, filePath).replace(/\\/g, "/")} contains ${pattern.reason}: "${pattern.token}"`);
    }
  }
}

const requiredTextFields = [
  ["brand.headline", siteContent.brand?.headline],
  ["brand.subheadline", siteContent.brand?.subheadline],
  ["brand.primaryCtaLabel", siteContent.brand?.primaryCtaLabel],
  ["brand.secondaryCtaLabel", siteContent.brand?.secondaryCtaLabel],
  ["contact.title", siteContent.contact?.title],
];

for (const [field, value] of requiredTextFields) {
  if (typeof value !== "string" || value.trim() === "") {
    addFinding(`Missing required content field: ${field}`);
  }
}

const titleRules = [
  ["brand.headline", siteContent.brand?.headline, 12, 84],
  ["uiText.storyTitle", siteContent.uiText?.storyTitle, 10, 72],
  ["uiText.testimonialsTitle", siteContent.uiText?.testimonialsTitle, 10, 72],
  ["uiText.faqTitle", siteContent.uiText?.faqTitle, 10, 72],
  ["contact.title", siteContent.contact?.title, 10, 60],
];

for (const [field, value, maxWords, maxChars] of titleRules) {
  if (typeof value !== "string" || value.trim() === "") {
    continue;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  const wordCount = normalized.split(" ").length;

  if (wordCount > maxWords || normalized.length > maxChars) {
    addFinding(`${field} is too long for the 2-line title rule (${wordCount} words, ${normalized.length} chars).`);
  }
}

if ((clientProfile.projectType || "").toLowerCase() === "e-commerce") {
  const commerceText = JSON.stringify(siteContent).toLowerCase();
  if (commerceText.includes("servicio principal")) {
    addFinding('E-commerce content still contains "servicio principal". Use commerce-oriented wording instead.');
  }
}

const demoDir = path.join(root, "public", "assets", "demo");
if (fs.existsSync(demoDir)) {
  for (const fileName of fs.readdirSync(demoDir)) {
    if (!fileName.endsWith(".svg")) {
      continue;
    }
    const svgContent = fs.readFileSync(path.join(demoDir, fileName), "utf8");
    if (svgContent.includes("<text")) {
      addFinding(`Demo SVG "${fileName}" contains embedded <text>. Remove duplicate visible text from artwork when HTML already renders the copy.`);
    }
  }
}

if (findings.length > 0) {
  console.error("Content QA failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Content QA passed.");
