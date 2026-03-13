import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const findings = [];

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  const raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

const requiredDocs = [
  "AGENTS.md",
  ".cursorrules",
  "ai/prompt-web-generator.md",
  "content/raw.txt",
  "content/brief.yaml",
  "scripts/watch-raw.ps1",
  "run-ai.cmd",
  "docs/QA_WORKFLOW.md",
  "docs/ENGINE_QA_LANDING.md",
  "docs/ENGINE_QA_BRAND.md",
  "docs/ENGINE_QA_STOREFRONT.md",
  "docs/ENGINE_QA_AGENCY.md",
  "docs/UI_GUARDRAILS.md",
  "docs/STOREFRONT_QA.md",
];

const requiredDirectories = [
  "ai",
  "content",
  "scripts",
];

const requiredConfig = [
  "config/client-profile.json",
  "config/site-content.json",
  "config/visual-presets.json",
  "config/starter-kits.json",
  "scripts/generate-website.mjs",
  "scripts/qa-scorecards.mjs",
  "src/lib/brief-generator.ts",
];

for (const relativePath of [...requiredDocs, ...requiredConfig]) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    findings.push(`Missing required project file: ${relativePath}`);
  }
}

for (const relativePath of requiredDirectories) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
    findings.push(`Missing required project directory: ${relativePath}`);
  }
}

const pkg = readJson("package.json");
for (const scriptName of ["brief:extract", "generate:website", "typecheck", "build", "qa:project", "qa:content", "qa:scorecards", "qa:visual", "qa"]) {
  if (!pkg.scripts?.[scriptName]) {
    findings.push(`package.json is missing script "${scriptName}"`);
  }
}

const siteContent = readJson("config/site-content.json");
const clientProfile = readJson("config/client-profile.json");

if (!siteContent.theme?.layoutMode) {
  findings.push("config/site-content.json must include theme.layoutMode");
}

if (!clientProfile.brandConfig?.layoutMode) {
  findings.push("config/client-profile.json must include brandConfig.layoutMode");
}

if (findings.length > 0) {
  console.error("Project QA failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Project QA passed.");
