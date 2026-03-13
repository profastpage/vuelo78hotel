import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content");
const configDir = path.join(root, "config");
const rawPath = path.join(contentDir, "raw.txt");
const briefPath = path.join(contentDir, "brief.yaml");
const profilePath = path.join(configDir, "client-profile.json");
const siteContentPath = path.join(configDir, "site-content.json");
const snapshotPath = path.join(contentDir, "reference-snapshot.json");
const outlinePath = path.join(contentDir, "reference-outline.md");

const args = parseArgs(process.argv.slice(2));
const referenceUrl = normalizeUrl(args.url || args.u || "");
const execFileAsync = promisify(execFile);
const forceBrowserCapture = Boolean(args.browser || args["browser-first"] || args.robust);

if (!referenceUrl) {
  console.error("Reference capture failed.");
  console.error("Missing --url");
  process.exit(1);
}

async function readJson(filePath, fallback = {}) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const nextToken = argv[index + 1];
    if (!nextToken || nextToken.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = nextToken;
    index += 1;
  }

  return parsed;
}

function normalizeUrl(value) {
  const candidate = String(value || "").trim();
  if (!candidate) {
    return "";
  }

  const normalized = /^[a-z]+:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

  try {
    return new URL(normalized).toString();
  } catch {
    return "";
  }
}

async function fetchText(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`No se pudo descargar ${url}. Status ${response.status}`);
    }

    return response.text();
  } catch {
    return fetchTextWithPowerShell(url);
  }
}

async function fetchTextWithPowerShell(url) {
  const command = [
    "$ProgressPreference='SilentlyContinue'",
    `$response = Invoke-WebRequest -Uri '${url.replace(/'/g, "''")}' -UseBasicParsing`,
    "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8",
    "Write-Output $response.Content",
  ].join("; ");

  const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command], {
    maxBuffer: 20 * 1024 * 1024,
  });

  if (!stdout || !stdout.trim()) {
    throw new Error(`No se pudo descargar ${url} via PowerShell.`);
  }

  return stdout;
}

async function loadPlaywright() {
  try {
    return await import("playwright-core");
  } catch {
    return null;
  }
}

function getBrowserExecutableCandidates() {
  const envCandidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    process.env.CHROME_BIN,
    process.env.CHROMIUM_PATH,
  ].filter(Boolean);

  const windowsCandidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  return Array.from(new Set([...envCandidates, ...windowsCandidates]));
}

async function findBrowserExecutable() {
  for (const candidate of getBrowserExecutableCandidates()) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return "";
}

async function scrollEntirePage(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = Math.max(400, Math.floor(window.innerHeight * 0.7));
      const timer = window.setInterval(() => {
        const maxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        total += step;
        window.scrollTo(0, Math.min(total, maxScroll));
        if (total >= maxScroll) {
          window.clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 120);
    });
  });
}

async function expandInteractivePatterns(page) {
  await page.evaluate(() => {
    document.querySelectorAll("details").forEach((element) => {
      element.setAttribute("open", "open");
    });
  });

  const selectors = [
    "[role='tab']",
    "[data-bs-toggle='tab']",
    "[data-toggle='tab']",
    ".tab",
    ".tabs button",
    ".tabs a",
    ".accordion button",
    ".faq button",
  ];

  for (const selector of selectors) {
    const elements = await page.locator(selector).elementHandles();
    for (const element of elements.slice(0, 8)) {
      try {
        await element.scrollIntoViewIfNeeded();
        await element.click({ timeout: 1200 });
        await page.waitForTimeout(120);
      } catch {
        continue;
      }
    }
  }
}

function normalizeColorToken(value) {
  const input = String(value || "").trim();
  if (!input) {
    return "";
  }

  const hexMatch = input.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hexValue = hexMatch[1].length === 3
      ? hexMatch[1].split("").map((char) => char + char).join("")
      : hexMatch[1];
    return `#${hexValue.toUpperCase()}`;
  }

  const rgbMatch = input.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!rgbMatch) {
    return "";
  }

  const toHex = (channel) => Number(channel).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
}

async function captureRenderedPage(url) {
  const playwright = await loadPlaywright();
  if (!playwright?.chromium) {
    return null;
  }

  const executablePath = await findBrowserExecutable();
  if (!executablePath) {
    return null;
  }

  const browser = await playwright.chromium.launch({
    executablePath,
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 2200 },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0 Safari/537.36",
      locale: "es-PE",
      colorScheme: "light",
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1800);
    try {
      await page.waitForLoadState("networkidle", { timeout: 12000 });
    } catch {
      // Algunas webs nunca quedan realmente idle.
    }

    await expandInteractivePatterns(page);
    await scrollEntirePage(page);

    const html = await page.content();
    const designTokens = await page.evaluate(() => {
      const colorSet = new Set();
      const fontSet = new Set();
      const radiusSet = new Set();

      const nodes = Array.from(document.querySelectorAll("*")).slice(0, 800);
      for (const node of nodes) {
        const style = window.getComputedStyle(node);
        const colors = [
          style.color,
          style.backgroundColor,
          style.borderTopColor,
          style.borderRightColor,
          style.borderBottomColor,
          style.borderLeftColor,
        ];

        for (const color of colors) {
          if (color && !/rgba?\(0,\s*0,\s*0,\s*0\)/i.test(color) && !/transparent/i.test(color)) {
            colorSet.add(color);
          }
        }

        if (style.fontFamily) {
          fontSet.add(style.fontFamily.replace(/["']/g, "").trim());
        }

        if (style.borderRadius && style.borderRadius !== "0px") {
          radiusSet.add(style.borderRadius.trim());
        }
      }

      const firstHeroMedia =
        document.querySelector("main img, header img, section img, img")?.getAttribute("src")
        || "";

      return {
        palette: Array.from(colorSet).slice(0, 12),
        fonts: Array.from(fontSet).slice(0, 8),
        radii: Array.from(radiusSet).slice(0, 8),
        heroMediaUrl: firstHeroMedia,
      };
    });

    await context.close();

    return {
      html,
      designTokens: {
        palette: designTokens.palette.map((item) => normalizeColorToken(item)).filter(Boolean),
        fonts: designTokens.fonts.map((item) => sanitizeText(item)).filter(Boolean),
        radii: designTokens.radii.map((item) => sanitizeText(item)).filter(Boolean),
        heroMediaUrl: normalizeUrl(designTokens.heroMediaUrl || ""),
      },
      method: "browser",
      executablePath,
    };
  } finally {
    await browser.close();
  }
}

function sanitizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .trim();
}

function hasBlockingSignals(html) {
  const sample = sanitizeText(html).toLowerCase();
  return /cloudflare|attention required|captcha|enable javascript|access denied|verify you are human|press and hold/i.test(sample);
}

function estimateHtmlQuality(html) {
  if (!html) {
    return -1;
  }

  const $ = cheerio.load(html);
  const title = sanitizeText($("title").first().text());
  const headings = $("h1,h2,h3").length;
  const sections = getSectionCandidates($).length;
  const media = $("img,video,picture").length;

  let score = 0;
  if (title) score += 2;
  if (headings >= 2) score += 3;
  if (sections >= 5) score += 4;
  if (media >= 3) score += 2;
  if (sanitizeText($("body").text()).length >= 800) score += 3;
  if (hasBlockingSignals(html)) score -= 8;

  return score;
}

function mergeDesignTokens(staticTokens, browserTokens) {
  if (!browserTokens) {
    return staticTokens;
  }

  return {
    palette: Array.from(new Set([...(browserTokens.palette || []), ...(staticTokens.palette || [])])).slice(0, 10),
    fonts: Array.from(new Set([...(browserTokens.fonts || []), ...(staticTokens.fonts || [])])).slice(0, 8),
    radii: Array.from(new Set([...(browserTokens.radii || []), ...(staticTokens.radii || [])])).slice(0, 8),
    heroMediaUrl: browserTokens.heroMediaUrl || staticTokens.heroMediaUrl || "",
  };
}

function readNodeText(node) {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return node.data || "";
  }

  if (!Array.isArray(node.children)) {
    return "";
  }

  return node.children.map((child) => readNodeText(child)).join(" ");
}

function extractMeta($) {
  return {
    title: sanitizeText($("title").first().text()),
    description: sanitizeText($('meta[name="description"]').attr("content") || ""),
    language: sanitizeText($("html").attr("lang") || ""),
  };
}

function collectStylesheetUrls($, baseUrl) {
  return $("link[rel='stylesheet']")
    .toArray()
    .map((element) => $(element).attr("href"))
    .filter(Boolean)
    .map((href) => {
      try {
        return new URL(href, baseUrl).toString();
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .slice(0, 6);
}

async function collectCssTexts(urls) {
  const cssTexts = await Promise.all(
    urls.map(async (url) => {
      try {
        return await fetchText(url);
      } catch {
        return "";
      }
    }),
  );

  return cssTexts.filter(Boolean);
}

function extractDesignTokens(cssTexts, $, baseUrl) {
  const palette = new Set();
  const fonts = new Set();
  const radii = new Set();
  const inlinePalette = [];

  for (const cssText of cssTexts) {
    for (const match of cssText.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) {
      palette.add(match[0].toUpperCase());
      if (palette.size >= 8) {
        break;
      }
    }

    for (const match of cssText.matchAll(/font-family\s*:\s*([^;]+);/gi)) {
      const family = sanitizeText(match[1].replace(/["']/g, ""));
      if (family) {
        fonts.add(family);
      }
      if (fonts.size >= 6) {
        break;
      }
    }

    for (const match of cssText.matchAll(/border-radius\s*:\s*([^;]+);/gi)) {
      const radius = sanitizeText(match[1]);
      if (radius) {
        radii.add(radius);
      }
      if (radii.size >= 6) {
        break;
      }
    }
  }

  $("[style]").each((_, element) => {
    const style = $(element).attr("style") || "";
    for (const match of style.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) {
      inlinePalette.push(match[0].toUpperCase());
      if (inlinePalette.length >= 8) {
        return false;
      }
    }
    return undefined;
  });

  const heroImage = $("img").first().attr("src");
  const heroMediaUrl = heroImage ? new URL(heroImage, baseUrl).toString() : "";

  return {
    palette: Array.from(new Set([...palette, ...inlinePalette])).slice(0, 8),
    fonts: Array.from(fonts).slice(0, 6),
    radii: Array.from(radii).slice(0, 6),
    heroMediaUrl,
  };
}

function getSectionCandidates($) {
  const seen = new Set();
  const candidates = [];

  const pushElement = (element) => {
    if (!element || seen.has(element)) {
      return;
    }

    const $element = $(element);
    const tag = element.tagName?.toLowerCase();
    const textLength = sanitizeText($element.text()).length;
    const childCount = $element.children().length;
    const hasHeading = $element.find("h1,h2,h3").length > 0;
    const hasMedia = $element.find("img,video,picture,canvas,svg").length > 0;
    const hasWidget = detectWidgets($element).length > 0;
    const isStructural = ["header", "footer", "nav", "section", "article", "main", "aside"].includes(tag || "");

    if (isStructural || hasHeading || hasMedia || hasWidget || childCount >= 3 || textLength >= 80) {
      candidates.push(element);
      seen.add(element);
    }
  };

  $("body > header, body > nav").each((_, element) => pushElement(element));

  const $main = $("main").first();
  if ($main.length) {
    $main.children().each((_, element) => pushElement(element));
  } else {
    $("body").children("section,article,div,aside").each((_, element) => pushElement(element));
  }

  $("body > footer, body footer").each((_, element) => pushElement(element));
  $("dialog,[role='dialog'],[class*='modal'],[class*='popup'],[id*='modal'],[id*='popup']").each((_, element) => pushElement(element));

  return candidates.slice(0, 16);
}

function detectWidgets($scope) {
  const widgets = new Set();
  const html = $scope.html() || "";
  const classBlob = sanitizeText($scope.attr("class") || "");
  const idBlob = sanitizeText($scope.attr("id") || "");
  const blob = `${classBlob} ${idBlob} ${html}`.toLowerCase();

  if ($scope.find("form").length > 0) widgets.add("form");
  if ($scope.find("[role='tablist'],[role='tab'],[class*='tab']").length > 0 || /\btabs?\b/.test(blob)) widgets.add("tabs");
  if ($scope.find("[role='dialog'],dialog,[class*='modal'],[class*='popup']").length > 0 || /\bmodal\b|\bpopup\b|\blightbox\b/.test(blob)) widgets.add("popup");
  if ($scope.find("[class*='accordion'],details,summary").length > 0 || /\bfaq\b|\baccordion\b/.test(blob)) widgets.add("accordion");
  if ($scope.find("[class*='swiper'],[class*='slick'],[class*='splide'],[class*='carousel'],[class*='slider']").length > 0 || /\bcarousel\b|\bslider\b|\bswiper\b|\bsplide\b/.test(blob)) widgets.add("slider");
  if ($scope.find("[class*='marquee'],[class*='ticker']").length > 0) widgets.add("marquee");
  if ($scope.find("video,iframe").length > 0) widgets.add("embedded-media");
  if ($scope.find("input[type='email']").length > 0) widgets.add("newsletter");
  if ($scope.find("[class*='pricing'],[class*='plan']").length > 0) widgets.add("pricing");
  if ($scope.find("[class*='testimonial'],[class*='review']").length > 0) widgets.add("testimonials");
  if ($scope.find("[class*='gallery'],[class*='masonry']").length > 0) widgets.add("gallery");
  if ($scope.find("[class*='counter'],[class*='stat']").length > 0) widgets.add("stats");
  if ($scope.find("button").length >= 2 || $scope.find("a").length >= 3) widgets.add("cta-group");

  return Array.from(widgets);
}

function countCards($scope) {
  return $scope.find("article,.card,.item,.feature,.service,.plan,.testimonial,.product,.collection").length;
}

function detectLayoutName($scope, widgets, cardCount, index) {
  const hasMedia = $scope.find("img,video,picture,canvas,svg").length > 0;
  const hasForm = widgets.includes("form");
  const hasAccordion = widgets.includes("accordion");
  const hasTabs = widgets.includes("tabs");
  const hasSlider = widgets.includes("slider");
  const childCount = $scope.children().length;

  if (index === 0 && hasMedia) return "hero split con media dominante";
  if (hasTabs) return "tabs con paneles";
  if (hasAccordion) return "acordeon vertical";
  if (hasSlider) return "rail horizontal o slider";
  if (hasForm) return "bloque de formulario";
  if (cardCount >= 4) return "grid de cards";
  if (hasMedia && childCount >= 2) return "layout editorial con media";
  if (childCount >= 4) return "stack modular";
  return "stack simple";
}

function classifySection($scope, index) {
  const tag = $scope.get(0)?.tagName?.toLowerCase() || "section";
  const id = sanitizeText($scope.attr("id") || "");
  const classes = sanitizeText($scope.attr("class") || "");
  const blob = `${tag} ${id} ${classes}`.toLowerCase();
  const widgets = detectWidgets($scope);
  const cardCount = countCards($scope);
  const headings = $scope
    .find("h1,h2,h3")
    .toArray()
    .map((element) => sanitizeText(readNodeText(element)))
    .filter(Boolean)
    .slice(0, 3);
  const hasHeroHeading = $scope.find("h1").length > 0;
  const hasForm = widgets.includes("form");
  const hasGallery = widgets.includes("gallery") || $scope.find("img").length >= 4;

  let type = "content";
  if (tag === "header" || tag === "nav" || $scope.find("nav").length > 0) type = "navbar";
  else if (tag === "footer") type = "footer";
  else if (widgets.includes("popup")) type = "popup";
  else if (hasHeroHeading || index === 0) type = "hero";
  else if (widgets.includes("accordion")) type = "faq";
  else if (widgets.includes("testimonials")) type = "testimonials";
  else if (widgets.includes("pricing")) type = "pricing";
  else if (hasForm && /\bcontact\b|\bbook\b|\breserv/i.test(blob)) type = "contact";
  else if (hasGallery) type = "gallery";
  else if (cardCount >= 3) type = "cards";
  else if (/\bservice\b|\bfeature\b|\bsolution\b/.test(blob)) type = "services";
  else if (/\bteam\b/.test(blob)) type = "team";
  else if (/\bnewsletter\b|\bsubscribe\b/.test(blob)) type = "newsletter";

  return {
    type,
    headings,
    widgets,
    cardCount,
    hasMedia: $scope.find("img,video,picture,canvas,svg").length > 0,
    ctaCount: $scope.find("a,button").length,
    layout: detectLayoutName($scope, widgets, cardCount, index),
  };
}

function getSectionLabel(type, index) {
  const map = {
    navbar: "Navbar",
    hero: "Hero",
    cards: "Cards",
    services: "Servicios",
    gallery: "Galeria",
    testimonials: "Testimonios",
    faq: "FAQ",
    pricing: "Planes",
    team: "Equipo",
    contact: "Contacto",
    newsletter: "Newsletter",
    popup: "Popup o modal",
    footer: "Footer",
    content: `Seccion ${index + 1}`,
  };

  return map[type] || map.content;
}

function buildSections($) {
  return getSectionCandidates($).map((element, index) => {
    const $section = $(element);
    const summary = classifySection($section, index);

    return {
      index: index + 1,
      label: getSectionLabel(summary.type, index),
      ...summary,
    };
  });
}

function aggregateWidgets(sections) {
  const counts = new Map();

  for (const section of sections) {
    for (const widget of section.widgets) {
      counts.set(widget, (counts.get(widget) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([name, count]) => ({ name, count }));
}

function inferProjectType(profile, sections, widgets) {
  const configuredType = sanitizeText(profile.projectType || "");
  if (configuredType && !/^sin preset$/i.test(configuredType)) {
    return configuredType;
  }

  const widgetNames = widgets.map((item) => item.name);
  const hasPricing = widgetNames.includes("pricing");
  const hasShopSignals = sections.some((section) => section.cardCount >= 6 && section.label === "Cards");
  if (hasPricing && hasShopSignals) {
    return "E-commerce";
  }

  if (sections.length <= 7) {
    return "Landing Page";
  }

  return "Web Site";
}

function inferIndustry(profile, snapshot) {
  const configuredIndustry = sanitizeText(profile.industry || "");
  if (configuredIndustry && !/^sin preset$/i.test(configuredIndustry)) {
    return configuredIndustry;
  }

  const hospitalitySource = [
    snapshot.sourceUrl,
    snapshot.meta?.title,
    snapshot.meta?.description,
    ...snapshot.sections.flatMap((section) => section.headings || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/(hotel|hoteler|hostal|hostel|resort|alojamiento|hosped|habitacion|suite|room|turism|turismo|hospitality)/i.test(hospitalitySource)) {
    return "Hoteleria";
  }

  return "Servicios";
}

function summarizeWidgetList(widgets) {
  if (!widgets.length) {
    return ["Sin widgets detectados"];
  }

  return widgets.map((item) => `${item.name} x${item.count}`);
}

function buildReferenceServices(sections, widgets) {
  const serviceLines = [
    "Hero shell: conservar una apertura visual fuerte con CTA principal visible.",
    "Sistema de secciones: respetar el ritmo del layout y el orden general de navegacion.",
  ];

  if (sections.some((section) => section.cardCount >= 3)) {
    serviceLines.push("Cards y grids: replicar densidad, columnas y agrupaciones visuales con contenido nuevo.");
  }

  if (widgets.some((item) => item.name === "tabs")) {
    serviceLines.push("Tabs: mantener la experiencia tabulada con labels nuevas y contenido editable.");
  }

  if (widgets.some((item) => item.name === "accordion")) {
    serviceLines.push("FAQ accordion: conservar el patron desplegable y el espaciado del bloque.");
  }

  if (widgets.some((item) => item.name === "slider")) {
    serviceLines.push("Slider o carousel: reproducir rieles y navegacion horizontal con placeholders.");
  }

  if (widgets.some((item) => item.name === "popup")) {
    serviceLines.push("Popup o modal: recrear la capa emergente con copy nuevo y disparadores equivalentes.");
  }

  return serviceLines.slice(0, 6);
}

function buildReferenceBenefits(sections, widgets, tokens) {
  const benefits = [
    `Conservar ${Math.max(sections.length, 1)} bloques principales con jerarquia visual parecida.`,
    `Mantener ${summarizeWidgetList(widgets).slice(0, 3).join(", ")} dentro del flujo final.`,
  ];

  if (tokens.palette.length) {
    benefits.push(`Usar una paleta nueva inspirada en ${tokens.palette.slice(0, 4).join(", ")} sin copiar branding.`);
  }

  if (tokens.fonts.length) {
    benefits.push(`Traducir el sistema tipografico de referencia a fuentes nuevas con rol similar.`);
  }

  benefits.push("Reemplazar todas las imagenes por placeholders con el mismo peso compositivo.");
  return benefits.slice(0, 5);
}

function buildReferenceFaq(widgets) {
  const hasTabs = widgets.some((item) => item.name === "tabs");
  const hasPopup = widgets.some((item) => item.name === "popup");
  const hasSlider = widgets.some((item) => item.name === "slider");

  return [
    {
      question: "Que debe clonarse de la web de referencia?",
      answer: "Solo layout, composicion, patrones interactivos y jerarquia visual. Nunca marca, logos, textos ni imagenes reales.",
    },
    {
      question: hasTabs ? "Se deben conservar las tabs detectadas?" : "Se deben conservar los widgets interactivos?",
      answer: hasTabs ? "Si. Deben replicarse las tabs con labels nuevas y contenido real del nuevo cliente." : "Si. Los widgets detectados se traducen a componentes reutilizables del sistema actual.",
    },
    {
      question: hasPopup ? "El popup o modal debe mantenerse?" : "Como se manejan sliders y railes?",
      answer: hasPopup ? "Si, pero con nuevo copy, nuevos triggers y sin copiar ningun asset del sitio original." : hasSlider ? "Se conserva el patron de rail horizontal o carousel con placeholders y contenido nuevo." : "Se conserva el comportamiento interactivo que aporte a la conversion y a la lectura del sitio.",
    },
  ];
}

function buildReferenceTestimonials() {
  return [
    "Cliente 1 | Referencia visual | El nuevo sitio conserva la fuerza visual del referente sin parecer una copia.",
    "Cliente 2 | UX | La estructura se siente familiar, clara y lista para vender con contenido propio.",
    "Cliente 3 | Conversion | El layout y los widgets mantienen el nivel premium sin reciclar textos ni imagenes.",
  ];
}

function buildReferenceRaw(profile, siteContent, snapshot) {
  const businessName = sanitizeText(profile.businessName || siteContent.brand?.name || "Nuevo negocio");
  const projectType = inferProjectType(profile, snapshot.sections, snapshot.widgets);
  const industry = inferIndustry(profile, snapshot);
  const hospitalityReference = /(hotel|hoteler|hostal|hostel|resort|alojamiento|hosped|habitacion|suite|room|turism|turismo|hospitality)/i.test(
    [industry, snapshot.sourceUrl, snapshot.meta?.title, snapshot.meta?.description, businessName].join(" "),
  );
  const existingOffer = sanitizeText(profile.brandConfig?.offerSummary || siteContent.brand?.headline || "");
  const existingGoal = sanitizeText(profile.brandConfig?.primaryGoal || siteContent.narrative?.goal || "");
  const existingAudience = sanitizeText(profile.brandConfig?.specialty || "");
  const mainOffer = hospitalityReference
    ? (/(hotel|habitacion|suite|reserva|alojamiento|hospedaje|tarapoto)/i.test(existingOffer)
      ? existingOffer
      : "Hotel en Tarapoto con habitaciones comodas, reserva directa y experiencia premium")
    : sanitizeText(existingOffer || "Oferta principal por definir");
  const primaryGoal = hospitalityReference
    ? (/(reserva|disponibilidad|habitacion|whatsapp)/i.test(existingGoal)
      ? existingGoal
      : "Generar reservas directas y consultas de disponibilidad")
    : sanitizeText(existingGoal || "Lanzar una web inspirada en la referencia");
  const targetAudience = hospitalityReference
    ? (/(viajer|huesped|pareja|famil|turist|ejecutiv)/i.test(existingAudience)
      ? existingAudience
      : "Viajeros que buscan descanso, buena ubicacion y una reserva clara desde el primer scroll")
    : sanitizeText(existingAudience || `Clientes que buscan ${mainOffer.toLowerCase()}`);
  const whatsapp = sanitizeText(profile.brandConfig?.whatsappNumber || siteContent.contact?.whatsappNumber || "");
  const email = sanitizeText(profile.brandConfig?.email || siteContent.contact?.email || "");
  const visualStyle = hospitalityReference ? "premium" : "editorial";
  const layoutMode = hospitalityReference ? "block" : "mixed";
  const shellMode = hospitalityReference ? "full-bleed" : "framed-seamless";
  const textAlign = hospitalityReference ? "left" : "center";
  const primaryColor = hospitalityReference ? "#C9A44F" : snapshot.designTokens.palette[0] || "#C96B3B";
  const secondaryColor = hospitalityReference ? "#173F7B" : snapshot.designTokens.palette[1] || "#14304A";
  const pageFlow = snapshot.sections.map((section) => {
    const widgetLabel = section.widgets.length ? ` | widgets: ${section.widgets.join(", ")}` : "";
    return `${section.label} | ${section.layout}${widgetLabel}`;
  });
  const services = buildReferenceServices(snapshot.sections, snapshot.widgets);
  const benefits = buildReferenceBenefits(snapshot.sections, snapshot.widgets, snapshot.designTokens);
  const faq = buildReferenceFaq(snapshot.widgets);
  const testimonials = buildReferenceTestimonials();
  const referenceWidgets = summarizeWidgetList(snapshot.widgets);
  const paletteText = snapshot.designTokens.palette.length ? snapshot.designTokens.palette.join(", ") : "paleta por definir";
  const fontsText = snapshot.designTokens.fonts.length ? snapshot.designTokens.fonts.join(" | ") : "tipografia por definir";
  const primaryCta = hospitalityReference ? "Reservar" : sanitizeText(siteContent.brand?.primaryCtaLabel || "Ver propuesta");
  const secondaryCta = hospitalityReference ? "Ver habitaciones" : sanitizeText(siteContent.brand?.secondaryCtaLabel || "Explorar secciones");
  const contactTitle = hospitalityReference
    ? "Confirma disponibilidad y reserva con claridad"
    : sanitizeText(siteContent.contact?.title || `Contacta a ${businessName}`);
  const contactDescription = hospitalityReference
    ? "Usa la estructura capturada para mostrar habitaciones, beneficios y una reserva directa sin friccion."
    : sanitizeText(siteContent.contact?.description || "Usa la estructura de referencia con contenido nuevo y placeholders.");

  const lines = [
    "General business data:",
    `- Business name: ${businessName}`,
    `- Project type: ${projectType}`,
    `- Industry: ${industry}`,
    `- Main offer: ${mainOffer}`,
    `- Primary goal: ${primaryGoal}`,
    `- Target audience: ${targetAudience}`,
    `- Location: ${sanitizeText(siteContent.location?.city || siteContent.location?.address || "")}`,
    `- WhatsApp: ${whatsapp}`,
    `- Email: ${email}`,
    `- Visual style: ${visualStyle}`,
    "- Theme: Light",
    `- Layout mode: ${layoutMode}`,
    `- Shell mode: ${shellMode}`,
    `- Text align: ${textAlign}`,
    "- Button shape: rounded",
    `- Primary color: ${primaryColor}`,
    `- Secondary color: ${secondaryColor}`,
    "",
    "Reference cloning:",
    "- REFERENCE_MODE: true",
    `- REFERENCE_WEBSITE: ${snapshot.sourceUrl}`,
    "- REFERENCE_CAPTURE_MODE: layout-text-widgets",
    "",
    "Business context:",
    hospitalityReference
      ? `${businessName} necesita una web hotelera inspirada en ${snapshot.sourceUrl}, conservando layout, ritmo visual, widgets y jerarquia premium de secciones. Todo texto, branding, logos e imagenes deben ser nuevos y orientados a reservas directas.`
      : `Construir una web nueva para ${businessName} inspirada en la estructura de ${snapshot.sourceUrl}, conservando solo layout, ritmo visual, widgets y jerarquia de secciones. Todo texto, branding, logos e imagenes deben ser nuevos.`,
    "",
    "Recommended page flow:",
    ...pageFlow.map((item) => `- ${item}`),
    "",
    projectType === "E-commerce" ? "Products:" : "Services:",
    ...services.map((item) => `- ${item}`),
    "",
    "Benefits:",
    ...benefits.map((item) => `- ${item}`),
    "",
    "FAQ:",
    ...faq.map((item) => `- ${item.question} ${item.answer}`),
    "",
    "Testimonials:",
    ...testimonials.map((item) => `- ${item}`),
    "",
    "CTA:",
    `- Primary CTA: ${primaryCta}`,
    `- Secondary CTA: ${secondaryCta}`,
    `- Contact title: ${contactTitle}`,
    `- Contact description: ${contactDescription}`,
    "",
    "Reference layout blueprint:",
    `- Secciones detectadas: ${snapshot.sections.length}`,
    `- Widgets detectados: ${referenceWidgets.join(", ")}`,
    `- Paleta observada: ${paletteText}`,
    `- Tipografias observadas: ${fontsText}`,
    "- Reglas de clonacion: copiar composicion y patron interactivo; reemplazar todo texto e imagen.",
    "",
    "Notes for AI copy:",
    "- Analyze the reference website only for layout inspiration.",
    "- Recreate structure, widgets, tabs, popups, and section flow with new copy and placeholder media.",
    "- Do not copy brand names, logos, text, or images from the reference website.",
  ];

  return `${lines.join("\n")}\n`;
}

function buildOutline(snapshot) {
  const lines = [
    "# Reference Outline",
    "",
    `- Source URL: ${snapshot.sourceUrl}`,
    `- Captured at: ${snapshot.capturedAt}`,
    `- Sections detected: ${snapshot.sections.length}`,
    `- Widgets detected: ${summarizeWidgetList(snapshot.widgets).join(", ")}`,
    "",
    "## Sections",
  ];

  for (const section of snapshot.sections) {
    lines.push(`- ${section.label} | ${section.layout} | cards: ${section.cardCount} | ctas: ${section.ctaCount} | media: ${section.hasMedia ? "yes" : "no"}`);
  }

  lines.push("", "## Design Tokens");
  lines.push(`- Palette: ${snapshot.designTokens.palette.join(", ") || "n/a"}`);
  lines.push(`- Fonts: ${snapshot.designTokens.fonts.join(" | ") || "n/a"}`);
  lines.push(`- Radii: ${snapshot.designTokens.radii.join(", ") || "n/a"}`);

  return `${lines.join("\n")}\n`;
}

async function main() {
  const [profile, siteContent] = await Promise.all([
    readJson(profilePath, {}),
    readJson(siteContentPath, {}),
  ]);

  let html = "";
  try {
    html = await fetchText(referenceUrl);
  } catch {
    html = "";
  }

  const staticQuality = estimateHtmlQuality(html);
  const shouldTryBrowser = forceBrowserCapture || staticQuality < 8 || hasBlockingSignals(html);
  const browserCapture = shouldTryBrowser ? await captureRenderedPage(referenceUrl).catch(() => null) : null;
  const browserQuality = estimateHtmlQuality(browserCapture?.html || "");
  const finalHtml = browserCapture && browserQuality >= staticQuality ? browserCapture.html : html;

  if (!finalHtml) {
    throw new Error("No se pudo obtener HTML util desde fetch ni desde navegador real.");
  }

  const $ = cheerio.load(finalHtml);
  const cssUrls = collectStylesheetUrls($, referenceUrl);
  const cssTexts = await collectCssTexts(cssUrls);
  const sections = buildSections($);
  const designTokens = mergeDesignTokens(extractDesignTokens(cssTexts, $, referenceUrl), browserCapture?.designTokens || null);
  const snapshot = {
    sourceUrl: referenceUrl,
    capturedAt: new Date().toISOString(),
    meta: extractMeta($),
    widgets: aggregateWidgets(sections),
    sections,
    designTokens,
    assets: {
      stylesheets: cssUrls,
      imageCount: $("img").length,
      videoCount: $("video,iframe").length,
    },
    captureMethod: browserCapture && browserQuality >= staticQuality ? browserCapture.method : "http",
  };

  const rawContent = buildReferenceRaw(profile, siteContent, snapshot);
  const outline = buildOutline(snapshot);

  await fs.mkdir(contentDir, { recursive: true });
  await Promise.all([
    fs.writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8"),
    fs.writeFile(outlinePath, outline, "utf8"),
    fs.writeFile(rawPath, rawContent, "utf8"),
  ]);

  await runNodeScript("scripts/generate-website.mjs");
  await runNodeScript("scripts/apply-brief-to-config.mjs");

  console.log("Reference capture completed.");
  console.log(`- URL: ${referenceUrl}`);
  console.log(`- Capture method: ${snapshot.captureMethod}`);
  console.log(`- Snapshot: ${path.relative(root, snapshotPath)}`);
  console.log(`- Raw: ${path.relative(root, rawPath)}`);
  console.log(`- Brief: ${path.relative(root, briefPath)}`);
}

async function runNodeScript(relativePath) {
  const moduleUrl = path.join(root, relativePath);
  const imported = await import(pathToFileUrl(moduleUrl).href);
  return imported;
}

function pathToFileUrl(filePath) {
  const normalized = path.resolve(filePath).replace(/\\/g, "/");
  return new URL(`file:///${normalized}`);
}

main().catch((error) => {
  console.error("Reference capture failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
