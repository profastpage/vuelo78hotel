import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const urlIndex = args.findIndex((arg) => arg === "--url");
const outDirIndex = args.findIndex((arg) => arg === "--out-dir");
const url = urlIndex >= 0 ? args[urlIndex + 1] : process.env.QA_VISUAL_URL;
const outDirArg = outDirIndex >= 0 ? args[outDirIndex + 1] : ".qa-output";

if (!url) {
  console.error("Visual QA requires a URL. Use: npm run qa:visual -- --url http://127.0.0.1:3000");
  process.exit(1);
}

const breakpoints = [
  { key: "320", width: 320, height: 1600 },
  { key: "375", width: 375, height: 1600 },
  { key: "768", width: 768, height: 1600 },
  { key: "1440", width: 1440, height: 1800 },
];

const outputDir = path.join(root, outDirArg, new Date().toISOString().replace(/[:.]/g, "-"));
fs.mkdirSync(outputDir, { recursive: true });

for (const breakpoint of breakpoints) {
  const outputFile = path.join(outputDir, `${breakpoint.key}.png`);
  const result = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    [
      "playwright",
      "screenshot",
      "--browser=chromium",
      `--viewport-size=${breakpoint.width},${breakpoint.height}`,
      "--wait-for-timeout=2500",
      "--full-page",
      url,
      outputFile,
    ],
    {
      cwd: root,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    console.error(`Visual QA failed at ${breakpoint.key}px.`);
    process.exit(result.status || 1);
  }
}

console.log(`Visual QA screenshots saved to ${path.relative(root, outputDir).replace(/\\/g, "/")}`);
