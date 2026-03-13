import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const findings = [];
const isTemplateProject = path.basename(root) === "_TEMPLATE_CODEX_REPO";

if (!isTemplateProject) {
  console.log("Template QA skipped for non-template project.");
  process.exit(0);
}

const requiredFiles = [
  "package.json",
  "AGENTS.md",
  ".cursorrules",
  "ai/prompt-web-generator.md",
  "content/raw.txt",
  "content/brief.yaml",
  "config/client-profile.json",
  "config/site-content.json",
  "config/visual-presets.json",
  "config/starter-kits.json",
  "docs/QA_WORKFLOW.md",
  "docs/STARTER_KITS.md",
  "docs/SCREEN_SCORECARDS.md",
  "docs/ENGINE_QA_LANDING.md",
  "docs/ENGINE_QA_BRAND.md",
  "docs/ENGINE_QA_STOREFRONT.md",
  "docs/ENGINE_QA_AGENCY.md",
  "src/app/page.tsx",
  "src/app/editor/page.tsx",
  "src/app/globals.css",
  "src/lib/brief-generator.ts",
  "src/lib/starter-kits.ts",
  "src/components/site/SiteRenderer.tsx",
  "src/components/site/FloatingReservationWidget.tsx",
  "src/components/site/LocalEditor.tsx",
  "src/components/site/LandingEngine.tsx",
  "src/types/site.ts",
  "scripts/generate-website.mjs",
  "scripts/qa-scorecards.mjs",
  "scripts/watch-raw.ps1",
  "run-ai.cmd",
];

const requiredDirectories = [
  "ai",
  "content",
  "scripts",
];

const encodingPatterns = [
  { token: "Ã", reason: "possible broken UTF-8 sequence" },
  { token: "â€", reason: "broken quote or chevron sequence" },
  { token: "â˜", reason: "broken symbol sequence" },
  { token: "�", reason: "replacement character found" },
];

function addFinding(message) {
  findings.push(message);
}

function ensureFile(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    addFinding(`Missing required file: ${relativePath}`);
  }
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  const raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
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

function relative(fullPath) {
  return path.relative(root, fullPath).replace(/\\/g, "/");
}

for (const file of requiredFiles) {
  ensureFile(file);
}

for (const directory of requiredDirectories) {
  const fullPath = path.join(root, directory);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
    addFinding(`Missing required directory: ${directory}`);
  }
}

const pkg = readJson("package.json");
for (const scriptName of ["brief:extract", "generate:website", "build", "typecheck", "qa:project", "qa:content", "qa:scorecards", "qa:visual", "qa:template", "qa"]) {
  if (!pkg.scripts?.[scriptName]) {
    addFinding(`package.json is missing script "${scriptName}"`);
  }
}

const clientProfile = readJson("config/client-profile.json");
if (typeof clientProfile.templateVersion !== "string" || clientProfile.templateVersion.trim() === "") {
  addFinding("config/client-profile.json is missing templateVersion");
}

const siteContent = readJson("config/site-content.json");
if (!Array.isArray(siteContent.services) || siteContent.services.length < 1) {
  addFinding("config/site-content.json must include at least one service");
}
if (!Array.isArray(siteContent.highlights) || siteContent.highlights.length < 1) {
  addFinding("config/site-content.json must include at least one highlight");
}
if (!siteContent.contact || typeof siteContent.contact.email !== "string") {
  addFinding("config/site-content.json must include a contact block with email");
}
if (!siteContent.theme || typeof siteContent.theme.layoutMode !== "string" || siteContent.theme.layoutMode.trim() === "") {
  addFinding("config/site-content.json must include theme.layoutMode");
}
if (!clientProfile.brandConfig || typeof clientProfile.brandConfig.layoutMode !== "string" || clientProfile.brandConfig.layoutMode.trim() === "") {
  addFinding("config/client-profile.json must include brandConfig.layoutMode");
}

const filesToScan = [
  ...walkFiles(path.join(root, "src"), new Set([".ts", ".tsx", ".css"])),
  ...walkFiles(path.join(root, "docs"), new Set([".md"])),
  ...walkFiles(path.join(root, "config"), new Set([".json"])),
];

for (const filePath of filesToScan) {
  const content = fs.readFileSync(filePath, "utf8");
  for (const pattern of encodingPatterns) {
    if (content.includes(pattern.token)) {
      addFinding(`${relative(filePath)} contains ${pattern.reason}: "${pattern.token}"`);
    }
  }
}

if (findings.length > 0) {
  console.error("Template QA failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Template QA passed.");
