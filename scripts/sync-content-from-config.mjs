import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPremiumContext, inferStarterKit } from "./lib/starter-kits.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configDir = path.join(root, "config");
const contentDir = path.join(root, "content");

const profilePath = path.join(configDir, "client-profile.json");
const siteContentPath = path.join(configDir, "site-content.json");
const rawPath = path.join(contentDir, "raw.txt");
const briefPath = path.join(contentDir, "brief.yaml");
const forceRaw = process.argv.includes("--force-raw");
const forceBrief = process.argv.includes("--force-brief");

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw.replace(/^\uFEFF/, ""));
}

async function readText(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

function asCleanString(value, fallback = "") {
  return String(value ?? fallback)
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function takeFilled(values, maxItems) {
  return values.filter(Boolean).slice(0, maxItems);
}

function normalizeProjectType(value) {
  const normalized = asCleanString(value).toLowerCase();
  if (normalized === "landing page") {
    return "Landing Page";
  }

  if (normalized === "e-commerce" || normalized === "ecommerce") {
    return "E-commerce";
  }

  return "Website";
}

function defaultPages(projectType) {
  if (projectType === "Landing Page") {
    return ["Home", "Benefits", "Services", "Testimonials", "FAQ", "Contact"];
  }

  if (projectType === "E-commerce") {
    return ["Home", "Categories", "Products", "Reviews", "FAQ", "Contact"];
  }

  return ["Home", "About", "Services", "Process", "Projects", "FAQ", "Contact"];
}

function ensureMinItems(items, minCount, factory) {
  const next = [...items];
  while (next.length < minCount) {
    next.push(factory(next.length));
  }
  return next;
}

function buildBrief(profile, siteContent) {
  const businessName = asCleanString(profile.businessName || siteContent.brand?.name, "Business Name");
  const projectType = normalizeProjectType(profile.projectType);
  const industry = asCleanString(profile.industry, "Servicios");
  const offerSummary = asCleanString(profile.brandConfig?.offerSummary || siteContent.brand?.headline, "Presentar la oferta con claridad");
  const primaryGoal = asCleanString(profile.brandConfig?.primaryGoal || siteContent.narrative?.goal, "Generar conversion");
  const businessDescription = asCleanString(
    profile.brandConfig?.businessDescription || siteContent.brand?.description || siteContent.narrative?.body,
    `${businessName} comunica su propuesta de valor con una presencia digital mas clara.`,
  );
  const location = asCleanString(siteContent.location?.city || siteContent.location?.address || "");
  const whatsapp = asCleanString(siteContent.contact?.whatsappNumber || profile.brandConfig?.whatsappNumber || "");
  const email = asCleanString(siteContent.contact?.email || profile.brandConfig?.email || "");
  const copyStyle = asCleanString(profile.brandConfig?.copyStyle || "professional");
  const referenceEnabled = Boolean(profile.reference?.enabled && asCleanString(profile.reference?.website));
  const referenceWebsite = asCleanString(profile.reference?.website || "");
  const targetAudience = asCleanString(
    profile.brandConfig?.specialty
      ? `Clientes ideales de ${businessName} interesados en ${profile.brandConfig.specialty.toLowerCase()}.`
      : `Clientes ideales de ${businessName} que buscan ${offerSummary.toLowerCase()}.`,
    `Clientes ideales de ${businessName}.`,
  );
  const starterKit = inferStarterKit({
    businessName,
    projectType,
    industry,
    businessDescription,
    mainOffer: offerSummary,
    targetAudience,
  });
  const premiumContext = buildPremiumContext({
    starterKit,
    recommendedSequence: profile.automation?.aiRouting?.recommendedSequence,
  });
  const themeMode = asCleanString(profile.brandConfig?.themeMode || starterKit?.theme?.mode || siteContent.theme?.mode || "Light");
  const visualStyle = asCleanString(profile.brandConfig?.visualStyle || starterKit?.theme?.visualStyle || siteContent.theme?.visualStyle || "premium");
  const layoutMode = asCleanString(profile.brandConfig?.layoutMode || starterKit?.theme?.layoutMode || siteContent.theme?.layoutMode || "soft");
  const shellMode = asCleanString(profile.brandConfig?.shellMode || starterKit?.theme?.shellMode || siteContent.theme?.shellMode || "framed");
  const textAlign = asCleanString(profile.brandConfig?.textAlign || starterKit?.theme?.textAlign || siteContent.theme?.textAlign || (projectType === "Landing Page" ? "center" : "left"));
  const buttonShape = asCleanString(profile.brandConfig?.buttonShape || starterKit?.theme?.buttonShape || siteContent.theme?.buttonShape || "rounded");
  const primaryColor = asCleanString(profile.brandConfig?.accentColor || starterKit?.theme?.primaryColor || siteContent.theme?.accentColor || "#C96B3B");
  const secondaryColor = asCleanString(profile.brandConfig?.accentAltColor || starterKit?.theme?.secondaryColor || siteContent.theme?.accentAltColor || "#14304A");
  const visualConcept = asCleanString(profile.brandConfig?.visualConcept || premiumContext.strategy.artDirection || "reusable website system");
  const layoutMood = asCleanString(profile.brandConfig?.layoutMood || premiumContext.designSystem.densityProfile || "structured");
  const visualSignature = asCleanString(profile.brandConfig?.visualSignature || starterKit?.theme?.visualSignature || "signature-lumen");
  const heroTag = asCleanString(siteContent.brand?.heroTag || starterKit?.brand?.heroTag, `${industry} destacado`);
  const services = ensureMinItems(
    takeFilled(
      (siteContent.services || []).map((item) => {
        const title = asCleanString(item?.title);
        const description = asCleanString(item?.description);
        if (!title || !description) {
          return null;
        }

        return { title, description };
      }),
      6,
    ),
    3,
    (index) => ({
      title: `Servicio ${index + 1}`,
      description: `Bloque comercial base para ${businessName}.`,
    }),
  );

  const benefits = ensureMinItems(
    takeFilled((siteContent.highlights || []).map((item) => asCleanString(item)), 6),
    3,
    (index) => `Diferencial ${index + 1} de ${businessName}`,
  );

  const faq = ensureMinItems(
    takeFilled(
      (siteContent.faqs || []).map((item) => {
        const question = asCleanString(item?.question);
        const answer = asCleanString(item?.answer);
        if (!question || !answer) {
          return null;
        }

        return { question, answer };
      }),
      5,
    ),
    3,
    (index) => ({
      question: `Pregunta frecuente ${index + 1}`,
      answer: `Respuesta base para ${businessName}.`,
    }),
  );

  const testimonials = ensureMinItems(
    takeFilled(
      (siteContent.testimonials || []).map((item) => {
        const name = asCleanString(item?.name);
        const role = asCleanString(item?.role, "Cliente");
        const quote = asCleanString(item?.quote);
        if (!name || !quote) {
          return null;
        }

        return { name, role, quote };
      }),
      5,
    ),
    3,
    (index) => ({
      name: `Cliente ${index + 1}`,
      role: `${industry} real`,
      quote: `${businessName} se entiende mejor y la navegacion se siente mas clara.`,
    }),
  );

  const products = takeFilled(
    (siteContent.products || []).map((item) => {
      const name = asCleanString(item?.name);
      const price = asCleanString(item?.price);
      const description = asCleanString(item?.description);
      if (!name || !price || !description) {
        return null;
      }

      return { name, price, description };
    }),
    8,
  );

  const keywords = ensureMinItems(
    takeFilled((siteContent.galleryKeywords || []).map((item) => asCleanString(item)), 8),
    3,
    (index) => [businessName, industry, offerSummary][index] || `Keyword ${index + 1}`,
  );

  const pages = ensureMinItems(
    takeFilled((siteContent.pages || []).map((item) => asCleanString(item)), 7),
    5,
    (index) => defaultPages(projectType)[index] || `Page ${index + 1}`,
  );

  return {
    businessName,
    projectType,
    industry,
    businessDescription,
    mainOffer: offerSummary,
    primaryGoal,
    targetAudience,
    location,
    contact: {
      whatsapp,
      email,
    },
    brand: {
      themeMode: themeMode === "Dark" ? "Dark" : "Light",
      visualStyle,
      layoutMode,
      shellMode,
      textAlign: textAlign === "center" ? "center" : "left",
      buttonShape: buttonShape === "square" ? "square" : "rounded",
      primaryColor,
      secondaryColor,
      copyStyle,
      visualConcept,
      layoutMood,
      visualSignature,
      starterKit: premiumContext.starterKitKey,
    },
    reference: {
      enabled: referenceEnabled,
      website: referenceWebsite,
      captureMode: asCleanString(profile.reference?.captureMode || (referenceEnabled ? "layout-text-widgets" : "none")),
    },
    hero: {
      tag: heroTag,
      headline: asCleanString(siteContent.brand?.headline, businessName),
      subtitle: asCleanString(siteContent.brand?.subheadline || siteContent.brand?.description, businessDescription),
    },
    services,
    benefits,
    faq,
    testimonials,
    cta: {
      primaryLabel: asCleanString(siteContent.brand?.primaryCtaLabel, projectType === "E-commerce" ? "Comprar" : "Contactar"),
      secondaryLabel: asCleanString(siteContent.brand?.secondaryCtaLabel, "Explorar"),
      contactTitle: asCleanString(siteContent.contact?.title, `Contacta a ${businessName}`),
      contactDescription: asCleanString(siteContent.contact?.description, businessDescription),
    },
    products,
    keywords,
    pages,
    strategy: {
      starterKit: premiumContext.starterKitKey,
      starterKitLabel: premiumContext.starterKitLabel,
      brandThesis: premiumContext.strategy.brandThesis,
      positioning: premiumContext.strategy.positioning,
      proofAngle: premiumContext.strategy.proofAngle,
      ctaStrategy: premiumContext.strategy.ctaStrategy,
      artDirection: premiumContext.strategy.artDirection,
      recommendedSkillSequence: premiumContext.strategy.recommendedSequence,
    },
    designSystem: {
      starterKit: premiumContext.designSystem.starterKit,
      typographySystem: premiumContext.designSystem.typographySystem,
      densityProfile: premiumContext.designSystem.densityProfile,
      motionProfile: premiumContext.designSystem.motionProfile,
      surfaceProfile: premiumContext.designSystem.surfaceProfile,
    },
    scorecardTargets: premiumContext.scorecardTargets,
  };
}

function yamlScalar(value) {
  const normalized = asCleanString(value);
  return `'${normalized.replace(/'/g, "''")}'`;
}

function pushYamlList(lines, key, values, indent = 0) {
  const prefix = " ".repeat(indent);
  if (values.length === 0) {
    lines.push(`${prefix}${key}: []`);
    return;
  }

  lines.push(`${prefix}${key}:`);
  for (const value of values) {
    lines.push(`${prefix}  - ${yamlScalar(value)}`);
  }
}

function pushYamlObjectList(lines, key, values, fields, indent = 0) {
  const prefix = " ".repeat(indent);
  if (values.length === 0) {
    lines.push(`${prefix}${key}: []`);
    return;
  }

  lines.push(`${prefix}${key}:`);
  for (const value of values) {
    lines.push(`${prefix}  - ${fields[0]}: ${yamlScalar(value[fields[0]])}`);
    for (const field of fields.slice(1)) {
      lines.push(`${prefix}    ${field}: ${yamlScalar(value[field])}`);
    }
  }
}

function buildBriefYaml(brief) {
  const lines = [
    `businessName: ${yamlScalar(brief.businessName)}`,
    `projectType: ${yamlScalar(brief.projectType)}`,
    `industry: ${yamlScalar(brief.industry)}`,
    `businessDescription: ${yamlScalar(brief.businessDescription)}`,
    `mainOffer: ${yamlScalar(brief.mainOffer)}`,
    `primaryGoal: ${yamlScalar(brief.primaryGoal)}`,
    `targetAudience: ${yamlScalar(brief.targetAudience)}`,
    `location: ${yamlScalar(brief.location)}`,
    "contact:",
    `  whatsapp: ${yamlScalar(brief.contact.whatsapp)}`,
    `  email: ${yamlScalar(brief.contact.email)}`,
    "brand:",
    `  themeMode: ${yamlScalar(brief.brand.themeMode)}`,
    `  visualStyle: ${yamlScalar(brief.brand.visualStyle)}`,
    `  layoutMode: ${yamlScalar(brief.brand.layoutMode)}`,
    `  shellMode: ${yamlScalar(brief.brand.shellMode)}`,
    `  textAlign: ${yamlScalar(brief.brand.textAlign)}`,
    `  buttonShape: ${yamlScalar(brief.brand.buttonShape)}`,
    `  primaryColor: ${yamlScalar(brief.brand.primaryColor)}`,
    `  secondaryColor: ${yamlScalar(brief.brand.secondaryColor)}`,
    `  copyStyle: ${yamlScalar(brief.brand.copyStyle)}`,
    `  visualConcept: ${yamlScalar(brief.brand.visualConcept)}`,
    `  layoutMood: ${yamlScalar(brief.brand.layoutMood)}`,
    `  visualSignature: ${yamlScalar(brief.brand.visualSignature)}`,
    "reference:",
    `  enabled: ${brief.reference.enabled ? "true" : "false"}`,
    `  website: ${yamlScalar(brief.reference.website)}`,
    `  captureMode: ${yamlScalar(brief.reference.captureMode)}`,
    "hero:",
    `  tag: ${yamlScalar(brief.hero.tag)}`,
    `  headline: ${yamlScalar(brief.hero.headline)}`,
    `  subtitle: ${yamlScalar(brief.hero.subtitle)}`,
  ];

  pushYamlObjectList(lines, "services", brief.services, ["title", "description"]);
  pushYamlList(lines, "benefits", brief.benefits);
  pushYamlObjectList(lines, "faq", brief.faq, ["question", "answer"]);
  pushYamlObjectList(lines, "testimonials", brief.testimonials, ["name", "role", "quote"]);

  lines.push("cta:");
  lines.push(`  primaryLabel: ${yamlScalar(brief.cta.primaryLabel)}`);
  lines.push(`  secondaryLabel: ${yamlScalar(brief.cta.secondaryLabel)}`);
  lines.push(`  contactTitle: ${yamlScalar(brief.cta.contactTitle)}`);
  lines.push(`  contactDescription: ${yamlScalar(brief.cta.contactDescription)}`);

  pushYamlObjectList(lines, "products", brief.products, ["name", "price", "description"]);
  pushYamlList(lines, "keywords", brief.keywords);
  pushYamlList(lines, "pages", brief.pages);
  lines.push("strategy:");
  lines.push(`  starterKit: ${yamlScalar(brief.strategy?.starterKit || "")}`);
  lines.push(`  starterKitLabel: ${yamlScalar(brief.strategy?.starterKitLabel || "")}`);
  lines.push(`  brandThesis: ${yamlScalar(brief.strategy?.brandThesis || "")}`);
  lines.push(`  positioning: ${yamlScalar(brief.strategy?.positioning || "")}`);
  lines.push(`  proofAngle: ${yamlScalar(brief.strategy?.proofAngle || "")}`);
  lines.push(`  ctaStrategy: ${yamlScalar(brief.strategy?.ctaStrategy || "")}`);
  lines.push(`  artDirection: ${yamlScalar(brief.strategy?.artDirection || "")}`);
  pushYamlList(lines, "recommendedSkillSequence", brief.strategy?.recommendedSkillSequence || [], 2);
  lines.push("designSystem:");
  lines.push(`  starterKit: ${yamlScalar(brief.designSystem?.starterKit || "")}`);
  lines.push(`  typographySystem: ${yamlScalar(brief.designSystem?.typographySystem || "")}`);
  lines.push(`  densityProfile: ${yamlScalar(brief.designSystem?.densityProfile || "")}`);
  lines.push(`  motionProfile: ${yamlScalar(brief.designSystem?.motionProfile || "")}`);
  lines.push(`  surfaceProfile: ${yamlScalar(brief.designSystem?.surfaceProfile || "")}`);
  lines.push("scorecardTargets:");
  lines.push(`  visual: ${Number(brief.scorecardTargets?.visual || 88)}`);
  lines.push(`  conversion: ${Number(brief.scorecardTargets?.conversion || 86)}`);
  lines.push(`  trust: ${Number(brief.scorecardTargets?.trust || 88)}`);
  lines.push(`  responsive: ${Number(brief.scorecardTargets?.responsive || 94)}`);
  lines.push(`  content: ${Number(brief.scorecardTargets?.content || 88)}`);

  return `${lines.join("\n")}\n`;
}

function buildRawText(brief) {
  const lines = [
    "General business data:",
    `- Business name: ${brief.businessName}`,
    `- Project type: ${brief.projectType}`,
    `- Industry: ${brief.industry}`,
    `- Main offer: ${brief.mainOffer}`,
    `- Primary goal: ${brief.primaryGoal}`,
    `- Target audience: ${brief.targetAudience}`,
    `- Location: ${brief.location}`,
    `- WhatsApp: ${brief.contact.whatsapp}`,
    `- Email: ${brief.contact.email}`,
    "",
    "Reference cloning:",
    `- REFERENCE_MODE: ${brief.reference.enabled ? "true" : "false"}`,
    `- REFERENCE_WEBSITE: ${brief.reference.website || "none"}`,
    `- REFERENCE_CAPTURE_MODE: ${brief.reference.captureMode}`,
    "",
    "Business context:",
    brief.businessDescription,
    "",
    "Premium strategy:",
    `- Starter kit: ${brief.strategy?.starterKitLabel || brief.strategy?.starterKit || "custom"}`,
    `- Brand thesis: ${brief.strategy?.brandThesis || "Presentar la oferta con claridad y jerarquia."}`,
    `- Positioning: ${brief.strategy?.positioning || "Oferta clara y premium."}`,
    `- Proof angle: ${brief.strategy?.proofAngle || "Prueba social y beneficios visibles."}`,
    `- CTA strategy: ${brief.strategy?.ctaStrategy || "CTA principal visible en hero y cierre."}`,
    `- Art direction: ${brief.strategy?.artDirection || "Direccion visual premium y comercial."}`,
    "",
    "Design system starter:",
    `- Typography system: ${brief.designSystem?.typographySystem || "display + sans ui"}`,
    `- Density profile: ${brief.designSystem?.densityProfile || "balanced premium"}`,
    `- Motion profile: ${brief.designSystem?.motionProfile || "subtle staged reveal"}`,
    `- Surface profile: ${brief.designSystem?.surfaceProfile || "layered premium shells"}`,
    "",
    "Quality targets:",
    `- Visual: ${brief.scorecardTargets?.visual || 88}`,
    `- Conversion: ${brief.scorecardTargets?.conversion || 86}`,
    `- Trust: ${brief.scorecardTargets?.trust || 88}`,
    `- Responsive: ${brief.scorecardTargets?.responsive || 94}`,
    `- Content: ${brief.scorecardTargets?.content || 88}`,
    "",
    "Services:",
    ...brief.services.map((item) => `- ${item.title}: ${item.description}`),
    "",
    "Benefits:",
    ...brief.benefits.map((item) => `- ${item}`),
    "",
    "FAQ:",
    ...brief.faq.map((item) => `- ${item.question} ${item.answer}`),
    "",
    "Testimonials:",
    ...brief.testimonials.map((item) => `- ${item.name} | ${item.role} | ${item.quote}`),
    "",
    "CTA:",
    `- Primary CTA: ${brief.cta.primaryLabel}`,
    `- Secondary CTA: ${brief.cta.secondaryLabel}`,
    `- Contact title: ${brief.cta.contactTitle}`,
    `- Contact description: ${brief.cta.contactDescription}`,
    "",
    "Notes for AI copy:",
    "Preserve the current visual style, theme, layout, and colors already defined in the project.",
    "Reuse the existing architecture and components.",
    ...(brief.reference.enabled
      ? [
          "Analyze the reference website only for layout inspiration.",
          "Recreate structure, widgets, tabs, popups, and composition with new brand assets and fresh copy.",
          "Do not copy brand names, logos, text, or images from the reference website.",
        ]
      : []),
  ];

  return `${lines.join("\n")}\n`;
}

async function main() {
  const [profile, siteContent] = await Promise.all([readJson(profilePath), readJson(siteContentPath)]);
  const brief = buildBrief(profile, siteContent);
  const [rawText, briefYaml] = [buildRawText(brief), buildBriefYaml(brief)];
  const [existingRaw, existingBrief] = await Promise.all([readText(rawPath), readText(briefPath)]);
  const preserveExistingRaw = !forceRaw && existingRaw.trim() && existingRaw.trim() !== rawText.trim();
  const preserveExistingBrief = preserveExistingRaw && !forceBrief && existingBrief.trim();

  await fs.mkdir(contentDir, { recursive: true });
  const writes = [];

  if (!preserveExistingRaw) {
    writes.push(fs.writeFile(rawPath, rawText, "utf8"));
  }

  if (!preserveExistingBrief) {
    writes.push(fs.writeFile(briefPath, briefYaml, "utf8"));
  }

  await Promise.all(writes);

  console.log(`Synced content from config for ${brief.businessName}`);
  console.log(`Starter kit: ${brief.strategy?.starterKitLabel || brief.strategy?.starterKit || "custom"}`);
  if (preserveExistingRaw) {
    console.log("Preserved existing content/raw.txt because it already contains manual business input.");
  }
  if (preserveExistingBrief) {
    console.log("Preserved existing content/brief.yaml because raw.txt was kept as the source of truth.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
