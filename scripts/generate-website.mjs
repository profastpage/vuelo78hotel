import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { extractBriefFromRaw } from "./lib/raw-to-brief.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rawPath = path.join(root, "content", "raw.txt");
const briefPath = path.join(root, "content", "brief.yaml");

async function main() {
  const rawText = await fs.readFile(rawPath, "utf8");
  const brief = extractBriefFromRaw(rawText);
  const yaml = YAML.stringify(brief, {
    lineWidth: 0,
    minContentWidth: 0,
  });

  await fs.writeFile(briefPath, yaml, "utf8");

  console.log("Website brief generated.");
  console.log(`- Source: ${path.relative(root, rawPath)}`);
  console.log(`- Brief: ${path.relative(root, briefPath)}`);
  console.log(`- Page type: ${brief.projectType}`);
  console.log(`- Industry: ${brief.industry}`);
  console.log(`- Services: ${brief.services.length}`);
  console.log(`- Benefits: ${brief.benefits.length}`);
  console.log(`- FAQ: ${brief.faq.length}`);
  console.log(`- Testimonials: ${brief.testimonials.length}`);
  console.log(`- Starter kit: ${brief.strategy?.starterKitLabel || brief.strategy?.starterKit || brief.brand?.starterKit || "custom"}`);
  console.log("The Next.js app now uses content/brief.yaml as the main generated source.");
}

main().catch((error) => {
  console.error("Website generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
