const { chromium, devices } = require("playwright");
const path = require("path");

const url = "https://vuelo78hotel.vercel.app/";
const outputDir = path.resolve("docs", "responsive-mockups");

const targets = [
  {
    name: "hero-desktop",
    selector: "#inicio",
    device: devices["Desktop Chrome"],
  },
  {
    name: "hero-mobile",
    selector: "#inicio",
    device: devices["Pixel 5"],
  },
  {
    name: "booking-desktop",
    selector: "#reserva",
    device: devices["Desktop Chrome"],
  },
  {
    name: "booking-mobile",
    selector: "#reserva",
    device: devices["Pixel 5"],
  },
  {
    name: "landing-desktop",
    selector: "body",
    device: devices["Desktop Chrome"],
  },
  {
    name: "landing-mobile",
    selector: "body",
    device: devices["Pixel 5"],
  },
];

function screenshotPath(name) {
  return path.join(outputDir, `${name}.png`);
}

async function capture(target) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...target.device,
    viewport: target.device.viewport,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const element = await page.waitForSelector(target.selector);
  await element.screenshot({
    path: screenshotPath(target.name),
    animations: "disabled",
    mask: [],
  });
  await browser.close();
}

async function run() {
  for (const target of targets) {
    console.log(`[capture] ${target.name} (${target.device.name})`);
    await capture(target);
  }
  console.log("Screenshots saved in", outputDir);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
