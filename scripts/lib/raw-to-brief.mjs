import { z } from "zod";
import { buildPremiumContext, inferStarterKit } from "./starter-kits.mjs";

const briefSchema = z.object({
  businessName: z.string().trim().min(1),
  projectType: z.enum(["Landing Page", "Website", "E-commerce"]),
  industry: z.string().trim().min(1),
  businessDescription: z.string().trim().min(1),
  mainOffer: z.string().trim().min(1),
  primaryGoal: z.string().trim().min(1),
  targetAudience: z.string().trim().min(1),
  location: z.string().trim(),
  contact: z.object({
    whatsapp: z.string().trim(),
    email: z.string().trim(),
  }),
  brand: z.object({
    themeMode: z.enum(["Light", "Dark"]),
    visualStyle: z.string().trim().min(1),
    layoutMode: z.string().trim().min(1),
    shellMode: z.string().trim().min(1),
    textAlign: z.enum(["left", "center"]),
    buttonShape: z.enum(["rounded", "square"]),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    copyStyle: z.string().trim().min(1),
    visualConcept: z.string().trim().min(1),
    layoutMood: z.string().trim().min(1),
    visualSignature: z.string().trim().min(1),
    starterKit: z.string().trim().default(""),
  }),
  reference: z.object({
    enabled: z.boolean().default(false),
    website: z.string().trim().default(""),
    captureMode: z.string().trim().default("none"),
  }).optional(),
  hero: z.object({
    tag: z.string().trim().min(1),
    headline: z.string().trim().min(1),
    subtitle: z.string().trim().min(1),
  }),
  services: z.array(
    z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
    }),
  ).min(3).max(6),
  benefits: z.array(z.string().trim().min(1)).min(3).max(6),
  faq: z.array(
    z.object({
      question: z.string().trim().min(1),
      answer: z.string().trim().min(1),
    }),
  ).min(3).max(5),
  testimonials: z.array(
    z.object({
      name: z.string().trim().min(1),
      role: z.string().trim().min(1),
      quote: z.string().trim().min(1),
    }),
  ).min(3).max(5),
  cta: z.object({
    primaryLabel: z.string().trim().min(1),
    secondaryLabel: z.string().trim().min(1),
    contactTitle: z.string().trim().min(1),
    contactDescription: z.string().trim().min(1),
  }),
  products: z.array(
    z.object({
      name: z.string().trim().min(1),
      price: z.string().trim().min(1),
      description: z.string().trim().min(1),
    }),
  ).max(8),
  keywords: z.array(z.string().trim().min(1)).min(3).max(8),
  pages: z.array(z.string().trim().min(1)).min(5).max(7),
  strategy: z.object({
    starterKit: z.string().trim().default(""),
    starterKitLabel: z.string().trim().default(""),
    brandThesis: z.string().trim().default(""),
    positioning: z.string().trim().default(""),
    proofAngle: z.string().trim().default(""),
    ctaStrategy: z.string().trim().default(""),
    artDirection: z.string().trim().default(""),
    recommendedSkillSequence: z.array(z.string().trim().min(1)).default([]),
  }).optional(),
  designSystem: z.object({
    starterKit: z.string().trim().default(""),
    typographySystem: z.string().trim().default(""),
    densityProfile: z.string().trim().default(""),
    motionProfile: z.string().trim().default(""),
    surfaceProfile: z.string().trim().default(""),
  }).optional(),
  scorecardTargets: z.object({
    visual: z.number().int().min(0).max(100).default(88),
    conversion: z.number().int().min(0).max(100).default(86),
    trust: z.number().int().min(0).max(100).default(88),
    responsive: z.number().int().min(0).max(100).default(94),
    content: z.number().int().min(0).max(100).default(88),
  }).optional(),
});

const sectionAliases = {
  services: ["services", "service", "servicios", "solutions", "solution"],
  benefits: ["benefits", "benefit", "beneficios", "advantages", "why choose us"],
  faq: ["faq", "faqs", "preguntas frecuentes", "questions"],
  testimonials: ["testimonials", "testimonial", "reviews", "review", "testimonios", "resenas"],
  products: ["products", "product", "catalog", "catalogue", "productos", "collections", "colecciones"],
  keywords: ["keywords", "keyword", "palabras clave", "tags"],
};

const structuredHeadingAliases = new Set([
  "general business data",
  "project data",
  "contact",
  "target audience",
  "main offer",
  "primary goal",
  "business context",
  "about section",
  "about hotel",
  "about business",
  "hero section",
  "services",
  "levels section",
  "rooms section",
  "hotel services",
  "room features",
  "benefits",
  "why us section",
  "gallery section",
  "tourism section",
  "testimonials section",
  "testimonials",
  "faq section",
  "faq",
  "reservation section",
  "contact section",
  "cta",
  "final cta",
]);

const inlineFieldLabels = new Set([
  "title",
  "subtitle",
  "text",
  "button",
  "buttons",
  "primary cta",
  "secondary cta",
  "question",
  "answer",
  "location",
  "address",
  "whatsapp",
  "phone",
  "email",
  "images",
  "hero image",
]);

const fieldAliases = {
  businessName: ["business name", "company name", "brand name", "nombre del negocio", "nombre de la empresa", "negocio", "marca"],
  projectType: ["project type", "page type", "website type", "tipo de proyecto", "tipo de pagina"],
  industry: ["industry", "niche", "sector", "rubro", "nicho"],
  businessDescription: ["description", "business description", "descripcion", "about", "about the business"],
  mainOffer: ["main offer", "offer", "oferta principal", "servicio principal", "main service", "main product"],
  primaryGoal: ["primary goal", "goal", "conversion goal", "objetivo principal"],
  targetAudience: ["target audience", "audience", "publico objetivo", "ideal client", "ideal customer"],
  location: ["location", "city", "ubicacion", "address"],
  whatsapp: ["whatsapp", "phone", "telefono", "mobile", "cell"],
  email: ["email", "correo", "mail"],
  visualStyle: ["visual style", "style", "estilo visual"],
  themeMode: ["theme", "theme mode", "modo", "theme style"],
  layoutMode: ["layout mode", "layout", "modo de layout", "modo de estructura"],
  shellMode: ["shell mode", "shell", "modo shell", "ancho de pagina", "page shell"],
  textAlign: ["text align", "text alignment", "alineacion", "alineacion de texto"],
  buttonShape: ["button shape", "shape", "forma de botones", "button style"],
  primaryColor: ["primary color", "brand color", "color primario"],
  secondaryColor: ["secondary color", "accent color", "color secundario"],
};

const sampleTestimonials = [
  ["Alex Rivera", "Founder"],
  ["Mia Chen", "Director"],
  ["Jordan Patel", "Operations Lead"],
  ["Sofia Martinez", "Owner"],
  ["Daniel Brooks", "Marketing Manager"],
];

export function extractBriefFromRaw(rawText) {
  const raw = normalizeInput(rawText);
  if (!raw) {
    throw new Error("content/raw.txt is empty.");
  }

  const lines = raw.split("\n").map((line) => line.trimEnd());
  const structured = extractStructuredData(lines);
  const fields = extractFields(lines);
  const sections = extractSections(lines);
  const email = firstValue(structured.fields.email, fields.email, extractEmail(raw), "");
  const whatsapp = normalizePhone(firstValue(structured.fields.whatsapp, fields.whatsapp, extractPhone(raw), ""));
  const projectType = normalizeProjectType(firstValue(structured.fields.projectType, fields.projectType, inferProjectType(raw), "Website"));
  const industry = normalizeIndustry(firstValue(structured.fields.industry, fields.industry, inferIndustry(raw), "Servicios"));
  const businessName = firstValue(structured.fields.businessName, fields.businessName, inferBusinessName(lines, email), "Business Name");
  const businessDescription = firstValue(
    structured.fields.businessDescription,
    fields.businessDescription,
    inferDescription(raw, lines, businessName),
    `${businessName} offers ${firstValue(fields.mainOffer, "", "professional services")} with a clear and professional presentation.`,
  );
  const mainOffer = firstValue(structured.fields.mainOffer, fields.mainOffer, inferMainOffer(sections, raw, projectType), defaultOffer(projectType, industry));
  const primaryGoal = firstValue(structured.fields.primaryGoal, fields.primaryGoal, inferPrimaryGoal(raw, projectType), defaultGoal(projectType));
  const targetAudience = firstValue(structured.fields.targetAudience, fields.targetAudience, inferAudience(raw, mainOffer), `People looking for ${mainOffer.toLowerCase()}`);
  const palette = getPalette(industry, projectType);
  const visualStyle = normalizeVisualStyle(firstValue(fields.visualStyle, defaultVisualStyle(projectType, industry), "normal"));
  const themeMode = normalizeThemeMode(firstValue(fields.themeMode, defaultThemeMode(projectType, industry, visualStyle), "Light"));
  const primaryColor = normalizeHex(firstValue(fields.primaryColor, palette.primary, palette.primary));
  const secondaryColor = normalizeHex(firstValue(fields.secondaryColor, palette.secondary, palette.secondary));
  const reference = extractReferenceSettings(raw);
  const hospitalityTheme = isHospitalityReference(raw, industry, businessDescription, mainOffer, targetAudience);
  const layoutMode = normalizeLayoutMode(firstValue(fields.layoutMode, hospitalityTheme ? "block" : defaultLayoutMode(projectType, industry)));
  const shellMode = normalizeShellMode(firstValue(fields.shellMode, hospitalityTheme ? "full-bleed" : defaultShellMode(projectType, industry)));
  const textAlign = normalizeTextAlign(firstValue(fields.textAlign, hospitalityTheme ? "left" : projectType === "Landing Page" ? "center" : "left"));
  const buttonShape = normalizeButtonShape(firstValue(fields.buttonShape, "rounded"));
  const services = buildServices(structured.sections.services.length > 0 ? structured.sections.services : sections.services, mainOffer, targetAudience, projectType, industry);
  const benefits = buildBenefits(structured.sections.benefits.length > 0 ? structured.sections.benefits : sections.benefits, services, projectType);
  const products = buildProducts(structured.sections.products.length > 0 ? structured.sections.products : sections.products, mainOffer, businessDescription, projectType);
  const faq = buildFaqs(structured.sections.faq.length > 0 ? structured.sections.faq : sections.faq, projectType, mainOffer, primaryGoal, businessName);
  const testimonials = buildTestimonials(structured.sections.testimonials.length > 0 ? structured.sections.testimonials : sections.testimonials, businessName, mainOffer, primaryGoal, industry);
  const hero = buildHero(projectType, businessName, mainOffer, primaryGoal, targetAudience, businessDescription, industry, structured.hero);
  const cta = buildCta(projectType, whatsapp, mainOffer, primaryGoal, structured.cta);
  const keywords = buildKeywords(sections.keywords, businessName, mainOffer, industry, services);
  const pages = buildPages(projectType, industry, hospitalityTheme, reference);
  const starterKit = inferStarterKit({
    businessName,
    projectType,
    industry,
    businessDescription,
    mainOffer,
    targetAudience,
  });
  const premiumContext = buildPremiumContext({ starterKit });

  return briefSchema.parse({
    businessName,
    projectType,
    industry,
    businessDescription,
    mainOffer,
    primaryGoal,
    targetAudience,
    location: firstValue(structured.fields.location, fields.location, "", ""),
    contact: {
      whatsapp,
      email,
    },
    brand: {
      themeMode,
      visualStyle,
      layoutMode,
      shellMode,
      textAlign,
      buttonShape,
      primaryColor,
      secondaryColor,
      copyStyle: buildCopyStyle(projectType, industry),
      visualConcept: buildVisualConcept(projectType, industry),
      layoutMood: buildLayoutMood(projectType, visualStyle),
      visualSignature: buildVisualSignature(visualStyle),
      starterKit: premiumContext.starterKitKey,
    },
    reference,
    hero,
    services,
    benefits,
    faq,
    testimonials,
    cta,
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
  });
}

export function buildOrderedRawFromBrief(brief) {
  const pageFlow = getPageFlow(brief.projectType);
  const lines = [
    "General business data:",
    `- Business name: ${brief.businessName}`,
    `- Project type: ${brief.projectType}`,
    `- Industry: ${brief.industry}`,
    `- Main offer: ${brief.mainOffer}`,
    `- Primary goal: ${brief.primaryGoal}`,
    `- Target audience: ${brief.targetAudience}`,
    `- Location: ${brief.location || "Pending"}`,
    `- WhatsApp: ${brief.contact.whatsapp || "Pending"}`,
    `- Email: ${brief.contact.email || "Pending"}`,
    "",
    "Reference cloning:",
    `- REFERENCE_MODE: ${brief.reference?.enabled ? "true" : "false"}`,
    `- REFERENCE_WEBSITE: ${brief.reference?.website || "none"}`,
    `- REFERENCE_CAPTURE_MODE: ${brief.reference?.captureMode || "none"}`,
    "",
    "Business context:",
    brief.businessDescription,
    "",
    "Premium strategy:",
    `- Starter kit: ${brief.strategy?.starterKitLabel || brief.strategy?.starterKit || "custom"}`,
    `- Brand thesis: ${brief.strategy?.brandThesis || "Presentar la oferta con claridad y jerarquia."}`,
    `- Positioning: ${brief.strategy?.positioning || "Oferta clara y premium."}`,
    `- Proof angle: ${brief.strategy?.proofAngle || "Prueba social y beneficios visibles."}`,
    `- CTA strategy: ${brief.strategy?.ctaStrategy || "CTA principal visible."}`,
    `- Art direction: ${brief.strategy?.artDirection || "Direccion visual premium."}`,
    "",
    "Design system starter:",
    `- Typography system: ${brief.designSystem?.typographySystem || "display + sans ui"}`,
    `- Density profile: ${brief.designSystem?.densityProfile || "balanced premium"}`,
    `- Motion profile: ${brief.designSystem?.motionProfile || "subtle staged reveal"}`,
    `- Surface profile: ${brief.designSystem?.surfaceProfile || "layered premium shells"}`,
    "",
    "Recommended page flow:",
    ...pageFlow.map((item) => `- ${item}`),
  ];

  if (brief.projectType === "E-commerce" && brief.products.length > 0) {
    lines.push("", "Products:", ...brief.products.map((item) => `- ${item.name} | ${item.price} | ${item.description}`));
  } else {
    lines.push("", "Services:", ...brief.services.map((item) => `- ${item.title}: ${item.description}`));
  }

  lines.push(
    "",
    "Benefits:",
    ...brief.benefits.map((item) => `- ${item}`),
    "",
    "Testimonials:",
    ...brief.testimonials.map((item) => `- ${item.name} | ${item.role} | ${item.quote}`),
    "",
    "FAQ:",
    ...brief.faq.map((item) => `- ${item.question} ${item.answer}`),
    "",
    "CTA:",
    `- Primary CTA: ${brief.cta.primaryLabel}`,
    `- Secondary CTA: ${brief.cta.secondaryLabel}`,
    `- Contact title: ${brief.cta.contactTitle}`,
    `- Contact description: ${brief.cta.contactDescription}`,
    "",
    "Notes for AI copy:",
    "- Preserve the current visual style, theme, layout, and colors already defined in the project.",
    "- Make titles more distinctive, short, and commercially sharp.",
    "- Make subtitles more persuasive, clear, and premium.",
    "- Make FAQ answers direct, credible, and objection-driven.",
    "- Make testimonials sound specific, natural, and results-oriented.",
    "- Reuse the current architecture and components.",
    ...(brief.reference?.enabled
      ? [
          "- Analyze the reference website only for layout inspiration.",
          "- Recreate structure, widgets, tabs, popups, and composition with new brand assets and fresh copy.",
          "- Do not copy brand names, logos, text, or images from the reference website.",
        ]
      : []),
  );

  return `${lines.join("\n")}\n`;
}

function extractReferenceSettings(raw) {
  const enabledMatch = raw.match(/REFERENCE_MODE\s*:\s*(true|false)/i);
  const websiteMatch = raw.match(/REFERENCE_WEBSITE\s*:\s*(.+)/i);
  const captureMatch = raw.match(/REFERENCE_CAPTURE_MODE\s*:\s*(.+)/i);
  const website = cleanSentence(websiteMatch?.[1] || "");
  const enabled = /true/i.test(enabledMatch?.[1] || "") && Boolean(website);

  return {
    enabled,
    website: enabled ? website : "",
    captureMode: enabled ? cleanSentence(captureMatch?.[1] || "layout-text-widgets") : "none",
  };
}

function normalizeInput(rawText) {
  const normalized = String(rawText || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trim();

  return repairMojibake(normalized);
}

function extractFields(lines) {
  const found = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^(?:[-*]\s*)?([^:]{2,60}):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const key = normalizeToken(match[1]);
    let value = match[2].trim();
    if (!value) {
      const nextValue = lines.slice(index + 1).find((candidate) => {
        const trimmed = candidate.trim();
        return trimmed && !trimmed.endsWith(":") && !/^(?:[-*]|\d+\.)\s+/.test(trimmed);
      });
      value = nextValue?.trim() || "";
    }
    const target = Object.entries(fieldAliases).find(([, aliases]) => aliases.some((alias) => normalizeToken(alias) === key));

    if (target && value) {
      found[target[0]] = value;
    }
  }

  return found;
}

function extractStructuredData(lines) {
  const structured = {
    fields: {},
    sections: {
      services: [],
      benefits: [],
      faq: [],
      testimonials: [],
      products: [],
    },
    hero: {},
    cta: {},
  };

  const blocks = splitStructuredBlocks(lines);

  for (const [blockName, blockLines] of Object.entries(blocks)) {
    switch (blockName) {
      case "general business data":
      case "project data":
      case "contact":
        Object.assign(structured.fields, extractFields(blockLines));
        break;
      case "target audience":
        structured.fields.targetAudience = firstMeaningfulParagraph(blockLines);
        break;
      case "main offer":
        structured.fields.mainOffer = firstMeaningfulParagraph(blockLines);
        break;
      case "primary goal":
        structured.fields.primaryGoal = firstMeaningfulParagraph(blockLines);
        break;
      case "about section":
      case "about hotel":
      case "about business":
      case "business context":
      case "tourism section":
        structured.fields.businessDescription = firstValue(
          structured.fields.businessDescription,
          extractValueByLabel(blockLines, "text"),
          firstMeaningfulParagraph(blockLines),
        );
        break;
      case "hero section":
        structured.hero.tag = extractValueByLabel(blockLines, "tag");
        structured.hero.headline = extractValueByLabel(blockLines, "title");
        structured.hero.subtitle = extractValueByLabel(blockLines, "subtitle");
        structured.cta.primaryLabel = extractValueByLabel(blockLines, "primary cta");
        structured.cta.secondaryLabel = extractValueByLabel(blockLines, "secondary cta");
        break;
      case "levels section":
      case "rooms section":
      case "hotel services":
      case "services":
        structured.sections.services.push(...extractServiceItems(blockLines));
        break;
      case "why us section":
      case "room features":
      case "benefits":
        structured.sections.benefits.push(...extractBenefitItems(blockLines));
        break;
      case "testimonials section":
      case "testimonials":
        structured.sections.testimonials.push(...extractTestimonialItems(blockLines));
        break;
      case "faq section":
      case "faq":
        structured.sections.faq.push(...extractFaqItems(blockLines));
        break;
      case "reservation section":
      case "cta":
        structured.cta.contactTitle = firstValue(structured.cta.contactTitle, extractValueByLabel(blockLines, "title"));
        structured.cta.contactDescription = firstValue(
          structured.cta.contactDescription,
          extractValueByLabel(blockLines, "text"),
        );
        structured.cta.primaryLabel = firstValue(
          structured.cta.primaryLabel,
          extractValueByLabel(blockLines, "button"),
          extractValueByLabel(blockLines, "primary cta"),
        );
        structured.cta.secondaryLabel = firstValue(
          structured.cta.secondaryLabel,
          extractValueByLabel(blockLines, "secondary cta"),
        );
        break;
      case "contact section":
        structured.fields.location = firstValue(
          structured.fields.location,
          extractValueByLabel(blockLines, "address"),
          extractValueByLabel(blockLines, "location"),
        );
        structured.fields.whatsapp = firstValue(
          structured.fields.whatsapp,
          extractValueByLabel(blockLines, "phone"),
          extractValueByLabel(blockLines, "whatsapp"),
        );
        structured.fields.email = firstValue(structured.fields.email, extractValueByLabel(blockLines, "email"));
        structured.cta.contactTitle = firstValue(structured.cta.contactTitle, extractValueByLabel(blockLines, "title"));
        break;
      case "final cta":
        structured.cta.contactTitle = firstValue(structured.cta.contactTitle, extractValueByLabel(blockLines, "title"));
        structured.cta.contactDescription = firstValue(structured.cta.contactDescription, extractValueByLabel(blockLines, "text"));
        structured.cta.primaryLabel = firstValue(structured.cta.primaryLabel, extractValueByLabel(blockLines, "button"));
        break;
      default:
        break;
    }
  }

  return structured;
}

function splitStructuredBlocks(lines) {
  const blocks = {};
  let currentBlock = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || /^-+$/.test(line)) {
      continue;
    }

    if (isStructuredHeading(line)) {
      currentBlock = normalizeToken(line);
      if (!blocks[currentBlock]) {
        blocks[currentBlock] = [];
      }
      continue;
    }

    if (currentBlock) {
      blocks[currentBlock].push(line);
    }
  }

  return blocks;
}

function isStructuredHeading(line) {
  const normalizedLine = normalizeToken(line.replace(/:$/, ""));

  if (/^(room|level)\s+\d+$/i.test(normalizedLine) || /^(question|answer)(\s+\d+)?$/i.test(normalizedLine)) {
    return false;
  }

  if (structuredHeadingAliases.has(normalizedLine)) {
    return true;
  }

  if (/section$/i.test(line)) {
    return true;
  }

  if (/^[A-Z0-9][A-Z0-9\s]+$/.test(line) && !line.includes(":")) {
    return true;
  }

  if (/^[A-Za-z0-9][A-Za-z0-9\s/&-]{2,60}:$/.test(line) && !inlineFieldLabels.has(normalizedLine)) {
    return true;
  }

  return false;
}

function extractValueByLabel(lines, label) {
  const normalizedLabel = normalizeToken(label);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^(?:[-*]\s*)?([^:]{2,60}):\s*(.*)$/);
    if (!match) {
      continue;
    }

    if (normalizeToken(match[1]) !== normalizedLabel) {
      continue;
    }

    if (match[2].trim()) {
      return cleanSentence(match[2]);
    }

    const nextLine = lines[index + 1];
    if (nextLine && !nextLine.includes(":")) {
      return cleanSentence(nextLine);
    }
  }

  return "";
}

function extractIndexedValues(lines, prefix) {
  const values = [];
  const normalizedPrefix = normalizeToken(prefix);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^(?:[-*]\s*)?([^:]{2,60}):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const key = normalizeToken(match[1]);
    if (!key.startsWith(normalizedPrefix)) {
      continue;
    }

    if (match[2].trim()) {
      values.push(cleanSentence(match[2]));
      continue;
    }

    const nextLine = lines[index + 1];
    if (nextLine && !nextLine.includes(":")) {
      const nextValue = cleanSentence(nextLine);
      const followLine = lines[index + 2];
      if (followLine && !followLine.includes(":") && key !== normalizedPrefix) {
        values.push(`${nextValue}: ${cleanSentence(followLine)}`);
        continue;
      }

      values.push(nextValue);
    }
  }

  return values;
}

function extractLevelItems(lines) {
  const items = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^Level\s+\d+:\s*$/i);
    if (match) {
      const title = cleanSentence(lines[index + 1]);
      const description = cleanSentence(lines[index + 2]);
      if (title && description) {
        items.push(`${title}: ${description}`);
      }
    }
  }

  if (items.length > 0) {
    return items;
  }

  return lines
    .map((line) => line.replace(/^(?:[-*]\s*)/, ""))
    .filter((line) => /:/.test(line));
}

function extractFaqItems(lines) {
  const items = [];
  let pendingQuestion = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^(?:[-*]\s*)?Question(?:\s+\d+)?\s*:\s*(.*)$/i);
    if (match) {
      pendingQuestion = cleanSentence(match[1] || lines[index + 1] || "");
      continue;
    }

    const answerMatch = line.match(/^(?:[-*]\s*)?Answer\s*:\s*(.*)$/i);
    if (!answerMatch) {
      continue;
    }

    const question = pendingQuestion;
    const answer = cleanSentence(answerMatch[1] || lines[index + 1] || "");
    if (question && answer) {
      items.push(`${question} ${answer}`);
    }

    pendingQuestion = "";
  }

  return items;
}

function extractServiceItems(lines) {
  const indexed = extractIndexedValues(lines, "room");
  if (indexed.length > 0) {
    return indexed;
  }

  const levels = extractLevelItems(lines);
  if (levels.length > 0) {
    return levels;
  }

  return extractLooseItems(lines, ["title", "text", "images"]);
}

function extractBenefitItems(lines) {
  const indexed = extractIndexedValues(lines, "benefit");
  if (indexed.length > 0) {
    return indexed;
  }

  return extractLooseItems(lines, ["title", "text", "images"]);
}

function extractTestimonialItems(lines) {
  const indexed = extractIndexedValues(lines, "testimonial");
  if (indexed.length > 0) {
    return indexed;
  }

  const items = [];
  let pendingQuote = "";

  for (const rawLine of lines) {
    const line = cleanSentence(rawLine);
    if (!line) {
      continue;
    }

    if (/^(?:title|text)\s*:/i.test(line)) {
      continue;
    }

    if (/^[—-]\s*/.test(line) && pendingQuote) {
      const author = cleanSentence(line.replace(/^[—-]\s*/, ""));
      items.push(`${author} | Huesped | ${stripWrappingQuotes(pendingQuote)}`);
      pendingQuote = "";
      continue;
    }

    pendingQuote = line;
  }

  return items;
}

function extractLooseItems(lines, ignoredLabels = []) {
  const ignored = new Set(ignoredLabels.map((label) => normalizeToken(label)));
  const items = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = cleanSentence(lines[index].replace(/^(?:[-*]\s*)/, ""));
    if (!line) {
      continue;
    }

    const match = line.match(/^([^:]{2,60}):\s*(.*)$/);
    if (match) {
      const key = normalizeToken(match[1]);
      if (ignored.has(key)) {
        continue;
      }

      if (match[2].trim()) {
        items.push(cleanSentence(match[2]));
      }

      continue;
    }

    items.push(line);
  }

  return items;
}

function firstMeaningfulParagraph(lines) {
  return cleanSentence(
    lines
      .filter((line) => line && !/^[A-Za-z0-9\s]+:$/.test(line))
      .join(" "),
  );
}

function repairMojibake(value) {
  const text = String(value || "");
  if (!/[ÃÂâ]/.test(text)) {
    return text;
  }

  const repaired = Buffer.from(text, "latin1").toString("utf8");
  const originalNoise = countMojibakeMarkers(text);
  const repairedNoise = countMojibakeMarkers(repaired);

  return repairedNoise < originalNoise ? repaired : text;
}

function countMojibakeMarkers(value) {
  const matches = String(value || "").match(/[ÃÂâ]/g);
  return matches ? matches.length : 0;
}

function extractSections(lines) {
  const sections = {
    services: [],
    benefits: [],
    faq: [],
    testimonials: [],
    products: [],
    keywords: [],
  };

  let currentSection = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const bulletMatch = trimmed.match(/^(?:[-*]|\d+\.)\s+(.+)$/);
    const genericHeading = bulletMatch ? null : trimmed.match(/^([^:]{2,40}):\s*(.*)$/);
    const headingCandidate = normalizeToken(trimmed.replace(/:$/, ""));
    const sectionName = Object.entries(sectionAliases).find(([, aliases]) => aliases.some((alias) => normalizeToken(alias) === headingCandidate))?.[0] ?? null;

    if (sectionName) {
      currentSection = sectionName;
      continue;
    }

    if (genericHeading) {
      currentSection = null;
      continue;
    }

    if (!bulletMatch) {
      continue;
    }

    const item = bulletMatch[1].trim();

    if (!currentSection) {
      continue;
    }

    sections[currentSection].push(item);
  }

  return sections;
}

function inferProjectType(raw) {
  const value = normalizeToken(raw);

  if (/(ecommerce|e commerce|e-commerce|storefront|tienda|catalog|catalogo|checkout|producto|productos)/.test(value)) {
    return "E-commerce";
  }

  if (/(landing|campaign|campana|lead|ads|conversion page)/.test(value)) {
    return "Landing Page";
  }

  return "Website";
}

function inferIndustry(raw) {
  const value = normalizeToken(raw);
  const matches = [
    ["Restaurante", /(restaurant|restaurante|menu|chef)/],
    ["Inmobiliaria", /(real estate|property|properties|inmobiliaria|broker|apartment)/],
    ["Clinica", /(clinic|clinica|doctor|medical|patient|salud)/],
    ["Tecnologia", /(technology|software|saas|app|automation|tecnologia|tech)/],
    ["Peluqueria", /(salon|peluqueria|hair|beauty|stylist)/],
    ["Moda", /(fashion|moda|apparel|clothing|drop|collection)/],
    ["Servicios", /(service|services|agency|studio|consulting|consultoria)/],
  ];

  for (const [label, pattern] of matches) {
    if (pattern.test(value)) {
      return label;
    }
  }

  return "Servicios";
}

function inferBusinessName(lines, email) {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.includes(":") || trimmed.length > 60) {
      continue;
    }

    if (!/[.!?]/.test(trimmed)) {
      return trimmed;
    }
  }

  if (email.includes("@")) {
    return titleCase(email.split("@")[1].split(".")[0].replace(/[-_]/g, " "));
  }

  return "";
}

function inferDescription(raw, lines, businessName) {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.includes(":")) {
      continue;
    }

    if (trimmed.length >= 50) {
      return trimmed;
    }
  }

  const firstParagraph = raw.split("\n\n").find((chunk) => chunk.trim().length >= 50);
  if (firstParagraph) {
    return firstParagraph.replace(/\s+/g, " ").trim();
  }

  return `${businessName} needs a clear, professional website that communicates value and drives the next action.`;
}

function inferMainOffer(sections, raw, projectType) {
  if (sections.services.length > 0) {
    return splitTitleAndDescription(sections.services[0]).title;
  }

  if (sections.products.length > 0) {
    return splitProduct(sections.products[0]).name;
  }

  if (projectType === "E-commerce") {
    return "online product sales";
  }

  if (/consulting|consultoria/.test(normalizeToken(raw))) {
    return "consulting services";
  }

  return "professional services";
}

function inferPrimaryGoal(raw, projectType) {
  const value = normalizeToken(raw);

  if (/(book|call|meeting|demo|consulta|consultation)/.test(value)) {
    return "Book qualified calls";
  }

  if (/(lead|whatsapp|contact form|contacto)/.test(value)) {
    return "Generate qualified enquiries";
  }

  if (projectType === "E-commerce") {
    return "Increase online purchases";
  }

  if (projectType === "Landing Page") {
    return "Generate qualified leads";
  }

  return "Build trust and generate enquiries";
}

function inferAudience(raw, mainOffer) {
  const match = raw.match(/target audience:\s*(.+)/i);
  if (match) {
    return match[1].trim();
  }

  return `People looking for ${mainOffer.toLowerCase()}`;
}

function extractEmail(raw) {
  return raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
}

function extractPhone(raw) {
  return raw.match(/\+?\d[\d\s()-]{7,}\d/)?.[0] ?? "";
}

function buildServices(items, mainOffer, targetAudience, projectType, industry) {
  const parsed = items
    .map((item) => splitTitleAndDescription(item))
    .filter((item) => item.title)
    .slice(0, 6);

  if (parsed.length >= 3) {
    return parsed;
  }

  const defaultsByType = {
    "Landing Page": [
      ["Offer messaging", `Clarify ${mainOffer.toLowerCase()} so visitors understand the value quickly.`],
      ["Conversion sections", "Build reusable sections for objections, proof, and CTA without changing the site architecture."],
      ["Launch-ready setup", "Prepare the page for contact, leads, and future edits inside the existing system."],
    ],
    Website: [
      ["Offer clarity", `Turn ${mainOffer.toLowerCase()} into a service presentation that feels easy to trust.`],
      ["Reusable service pages", "Organize services, proof, and contact around the current component structure."],
      ["Growth-ready updates", "Keep the site expandable without rebuilding the layout every time the offer evolves."],
    ],
    "E-commerce": [
      ["Category structure", "Organize the catalog so products stay easy to browse on desktop and mobile."],
      ["Conversion copy", "Write concise product and collection messaging that supports buying decisions."],
      ["Trust and purchase flow", "Strengthen reviews, benefits, and buying FAQ inside the current storefront architecture."],
    ],
  };

  return defaultsByType[projectType].map(([title, description]) => ({
    title,
    description: description.replace("{audience}", targetAudience.toLowerCase()).replace("{industry}", industry.toLowerCase()),
  }));
}

function buildBenefits(items, services, projectType) {
  const parsed = items.map((item) => cleanSentence(item)).filter(Boolean).slice(0, 6);
  if (parsed.length >= 3) {
    return parsed;
  }

  const defaultsByType = {
    "Landing Page": [
      "A clearer offer from the first scroll",
      "Stronger trust before the contact step",
      "Less friction between interest and action",
      "A faster path to qualified leads",
    ],
    Website: [
      "A clearer business narrative",
      "More trust and visual credibility",
      "Reusable sections that stay easy to edit",
      "A stronger path from interest to enquiry",
    ],
    "E-commerce": [
      "A more browseable catalog",
      "Stronger product trust signals",
      "Clearer buying decisions",
      "A smoother path to checkout",
    ],
  };

  const serviceDriven = services.slice(0, 2).map((service) => `Clearer positioning around ${service.title.toLowerCase()}`);
  return Array.from(new Set([...parsed, ...serviceDriven, ...defaultsByType[projectType]])).slice(0, 4);
}

function buildProducts(items, mainOffer, businessDescription, projectType) {
  const parsed = items
    .map((item) => splitProduct(item))
    .filter((item) => item.name)
    .slice(0, 8);

  if (parsed.length > 0) {
    return parsed;
  }

  if (projectType !== "E-commerce") {
    return [];
  }

  return [
    { name: titleCase(mainOffer), price: "From $49", description: cleanSentence(businessDescription) },
    { name: "Signature Collection", price: "From $79", description: "A higher-value option with stronger product framing and clearer merchandising." },
    { name: "Best Sellers Bundle", price: "From $99", description: "A curated bundle designed to make the first purchase decision easier." },
    { name: "New Arrivals", price: "From $59", description: "Fresh catalog inventory presented with concise benefits and trust-driven copy." },
  ];
}

function buildFaqs(items, projectType, mainOffer, primaryGoal, businessName) {
  const parsed = items
    .map((item) => splitFaq(item))
    .filter((item) => item.question && item.answer)
    .slice(0, 5);

  if (parsed.length >= 3) {
    return parsed;
  }

  const defaultsByType = {
    "Landing Page": [
      ["How fast can this page be ready?", "Most landing pages can move quickly because the current section system is reused and the copy is organized around conversion first."],
      ["Can the message be refined later?", "Yes. The copy structure is editable, so the offer can evolve without forcing a redesign."],
      ["Will it still feel clear on mobile?", "Yes. The same flow is written to stay easy to scan, credible, and action-oriented on mobile and desktop."],
      ["Can the CTA go to WhatsApp or a form?", `Yes. The main action can be aligned with ${primaryGoal.toLowerCase()} through the current contact route.`],
    ],
    Website: [
      ["Can the website grow without rebuilding everything?", "Yes. New sections and stronger messaging can be added while keeping the current reusable architecture intact."],
      ["Do we need a full redesign to improve the copy?", "No. The workflow is built to refresh the message, proof, and calls to action without replacing the site structure."],
      ["Can the site explain the service more clearly?", `Yes. ${titleCase(mainOffer)} can be turned into clearer sections, sharper proof, and a more direct conversion path.`],
      ["How does the contact journey work?", `The site is organized to help ${businessName} move visitors toward ${primaryGoal.toLowerCase()} with less friction.`],
    ],
    "E-commerce": [
      ["Can the catalog grow without breaking the layout?", "Yes. The storefront keeps the current product-first system and scales collections without changing the core structure."],
      ["Will the shopping flow still feel clear on mobile?", "Yes. Product grids, trust blocks, and FAQs stay organized for mobile and desktop browsing."],
      ["Can we emphasize reviews and trust?", "Yes. Buying benefits, reviews, and purchase FAQs remain part of the current storefront journey."],
      ["Can product copy be improved later?", "Yes. Product descriptions, collections, and selling angles can be refreshed without replacing the existing components."],
    ],
  };

  return defaultsByType[projectType].map(([question, answer]) => ({ question, answer }));
}

function buildTestimonials(items, businessName, mainOffer, primaryGoal, industry) {
  const parsed = items
    .map((item, index) => splitTestimonial(item, industry, index))
    .filter((item) => item.name && item.quote)
    .slice(0, 5);

  if (parsed.length >= 3) {
    return parsed;
  }

  return sampleTestimonials.slice(0, 3).map(([name, role], index) => ({
    name,
    role,
    quote: buildDefaultTestimonialQuote(index, businessName, mainOffer, primaryGoal),
  }));
}

function buildHero(projectType, businessName, mainOffer, primaryGoal, targetAudience, businessDescription, industry, overrides = {}) {
  const shortOffer = shortenPhrase(mainOffer, 6);
  const audience = shortenPhrase(targetAudience, 5);
  const hospitalityTheme = isHospitalityReference("", industry, businessDescription, mainOffer, targetAudience);
  const spanishContent = isSpanishText([businessDescription, mainOffer, primaryGoal, targetAudience, overrides.headline, overrides.subtitle].join(" "));

  if (hospitalityTheme) {
    const hotelHeadlines = spanishContent
      ? [
          `${capitalize(shortenPhrase(businessName, 5))}`,
          "Descanso premium con reserva directa",
          "Habitaciones claras para reservar mejor",
        ]
      : [
          `${capitalize(shortenPhrase(businessName, 5))}`,
          "Premium stays with direct booking",
          "Rooms presented with a clearer booking path",
        ];
    const hotelSubtitle = spanishContent
      ? `${capitalize(mainOffer)} con una experiencia visual hotelera mas clara y una ruta directa a ${primaryGoal.toLowerCase()}.`
      : `${capitalize(mainOffer)} with a clearer hotel-style experience and a direct path to ${primaryGoal.toLowerCase()}.`;

    return {
      tag: cleanSentence(firstValue(overrides.tag, buildHeroTag(projectType, industry, spanishContent))),
      headline: cleanSentence(firstValue(overrides.headline, limitWords(selectHeadline(hotelHeadlines), 10))),
      subtitle: cleanSentence(firstValue(overrides.subtitle, hotelSubtitle)),
    };
  }

  const headlines = {
    "Landing Page": selectHeadline([
      `${capitalize(shortOffer)} with sharper conversion`,
      `${capitalize(shortOffer)} that feels instantly credible`,
      `${capitalize(shortOffer)} designed to move faster`,
    ]),
    Website: selectHeadline([
      `Make ${shortenPhrase(businessName, 3)} feel unmistakable`,
      `${capitalize(shortOffer)} with stronger brand clarity`,
      `A sharper digital front for ${shortenPhrase(businessName, 3)}`,
    ]),
    "E-commerce": selectHeadline([
      `Turn ${shortOffer.toLowerCase()} into stronger demand`,
      `A storefront that sells with more clarity`,
      `${capitalize(shortOffer)} arranged to convert faster`,
    ]),
  };

  const subtitles = {
    "Landing Page": `Present ${mainOffer.toLowerCase()} with cleaner positioning, stronger proof, and a direct path to ${primaryGoal.toLowerCase()}.`,
    Website: `${businessDescription} The message is reorganized to feel clearer, more premium, and easier to trust from the first screen.`,
    "E-commerce": `Organize ${mainOffer.toLowerCase()} into a cleaner buying journey with stronger trust, better browsing, and sharper purchase triggers.`,
  };
  const defaultTag = buildHeroTag(projectType, industry, spanishContent);
  const defaultHeadline = limitWords(headlines[projectType], 10);
  const defaultSubtitle = cleanSentence(subtitles[projectType] || `${businessDescription} Built for ${audience.toLowerCase()}.`);

  return {
    tag: cleanSentence(firstValue(overrides.tag, defaultTag)),
    headline: cleanSentence(firstValue(overrides.headline, defaultHeadline)),
    subtitle: cleanSentence(firstValue(overrides.subtitle, defaultSubtitle)),
  };
}

function buildCta(projectType, whatsapp, mainOffer, primaryGoal, overrides = {}) {
  const hospitalityTheme = isHospitalityReference("", "", "", mainOffer, primaryGoal);
  const spanishContent = isSpanishText([mainOffer, primaryGoal, overrides.primaryLabel, overrides.contactTitle].join(" "));

  if (hospitalityTheme) {
    const primaryOverride = /book a call|start the conversation|contact us/i.test(String(overrides.primaryLabel || "")) ? "" : overrides.primaryLabel;
    const secondaryOverride = /view the offer|explore services/i.test(String(overrides.secondaryLabel || "")) ? "" : overrides.secondaryLabel;
    const titleOverride = /launch a page that closes objections faster|build a site that explains the offer better/i.test(String(overrides.contactTitle || ""))
      ? ""
      : overrides.contactTitle;
    const descriptionOverride = /share your current offer and goals|reuse the existing architecture/i.test(String(overrides.contactDescription || ""))
      ? ""
      : overrides.contactDescription;
    return {
      primaryLabel: firstValue(primaryOverride, spanishContent ? "Reservar" : "Book now"),
      secondaryLabel: firstValue(secondaryOverride, spanishContent ? "Ver habitaciones" : "View rooms"),
      contactTitle: firstValue(titleOverride, spanishContent ? "Confirma disponibilidad y reserva con claridad" : "Confirm availability and book with clarity"),
      contactDescription: firstValue(
        descriptionOverride,
        spanishContent
          ? `Usa la estructura capturada para mostrar habitaciones, beneficios y una reserva directa alineada con ${primaryGoal.toLowerCase()}.`
          : `Use the captured structure to present rooms, benefits, and a direct booking path aligned with ${primaryGoal.toLowerCase()}.`,
      ),
    };
  }

  if (projectType === "E-commerce") {
    return {
      primaryLabel: firstValue(overrides.primaryLabel, "Shop now"),
      secondaryLabel: firstValue(overrides.secondaryLabel, "Browse the catalog"),
      contactTitle: firstValue(overrides.contactTitle, "Move shoppers from interest to checkout"),
      contactDescription: firstValue(overrides.contactDescription, `Use the current storefront architecture to present ${mainOffer.toLowerCase()} with clearer buying paths, sharper trust, and less hesitation.`),
    };
  }

  const directLabel = /call|meeting|demo|consulta/i.test(primaryGoal) ? "Book a call" : "Start the conversation";

  return {
    primaryLabel: firstValue(overrides.primaryLabel, whatsapp ? directLabel : "Contact us"),
    secondaryLabel: firstValue(overrides.secondaryLabel, projectType === "Landing Page" ? "View the offer" : "Explore services"),
    contactTitle: firstValue(overrides.contactTitle, projectType === "Landing Page" ? "Launch a page that closes objections faster" : "Build a site that explains the offer better"),
    contactDescription: firstValue(overrides.contactDescription, `Share your current offer and goals. The system will reuse the existing architecture to support ${primaryGoal.toLowerCase()} with clearer copy and stronger flow.`),
  };
}

function buildKeywords(items, businessName, mainOffer, industry, services) {
  const parsed = items.map((item) => item.trim()).filter(Boolean);
  if (parsed.length >= 3) {
    return parsed.slice(0, 8);
  }

  return Array.from(
    new Set([
      businessName,
      industry,
      mainOffer,
      ...services.map((service) => service.title),
      "reusable components",
      "professional website",
    ]),
  )
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function buildPages(projectType, industry, hospitalityTheme, reference) {
  if (hospitalityTheme || (reference?.enabled && isHospitalityReference("", industry, "", "", ""))) {
    return ["Hotel", "Ofertas", "Habitaciones", "Servicios", "Galeria", "Reserva", "Mapa"];
  }

  if (projectType === "Landing Page") {
    return ["Home", "Benefits", "Services", "Testimonials", "FAQ", "Contact"];
  }

  if (projectType === "E-commerce") {
    return ["Home", "Categories", "Products", "Reviews", "FAQ", "Contact"];
  }

  return ["Home", "About", "Services", "Process", "Projects", "FAQ", "Contact"];
}

function buildCopyStyle(projectType, industry) {
  if (projectType === "E-commerce") {
    return `commercial, premium, persuasive, conversion-led, ${industry.toLowerCase()}-aware`;
  }

  if (projectType === "Landing Page") {
    return "conversion-focused, sharp, persuasive, premium, objection-aware";
  }

  return `professional, sharp, trust-building, premium, ${industry.toLowerCase()}-aware`;
}

function buildVisualConcept(projectType, industry) {
  if (projectType === "Landing Page") {
    return `${industry.toLowerCase()} campaign page`;
  }

  if (projectType === "E-commerce") {
    return `${industry.toLowerCase()} storefront`;
  }

  return `${industry.toLowerCase()} trust-led website`;
}

function buildLayoutMood(projectType, visualStyle) {
  if (projectType === "Landing Page") {
    return `conversion-first and ${visualStyle}`;
  }

  if (projectType === "E-commerce") {
    return `product-first and ${visualStyle}`;
  }

  return `structured and ${visualStyle}`;
}

function buildVisualSignature(visualStyle) {
  const map = {
    premium: "signature-cascade",
    luxury: "signature-aura",
    editorial: "signature-cascade",
    moderno: "signature-drift",
    tecnologico: "signature-lumen",
    bento: "signature-axis",
  };

  return map[visualStyle] || "signature-lumen";
}

function getPageFlow(projectType) {
  if (projectType === "Landing Page") {
    return ["Hero", "Benefits", "Offer blocks", "Proof", "FAQ", "CTA and contact"];
  }

  if (projectType === "E-commerce") {
    return ["Hero", "Products or collections", "Buying benefits", "Reviews", "Purchase FAQ", "Checkout CTA"];
  }

  return ["Hero", "Business story", "Services", "Proof", "FAQ", "Contact"];
}

function buildDefaultTestimonialQuote(index, businessName, mainOffer, primaryGoal) {
  const quotes = [
    `${businessName} made ${mainOffer.toLowerCase()} feel easier to trust and much easier to act on from the first visit.`,
    `The new message felt clearer, more premium, and far more aligned with ${primaryGoal.toLowerCase()}.`,
    "The site finally sounds like the level of business we actually wanted to project.",
  ];

  return quotes[index] || quotes[quotes.length - 1];
}

function selectHeadline(candidates) {
  return limitWords(candidates.find(Boolean) || "A clearer offer with stronger impact", 8);
}

function defaultOffer(projectType, industry) {
  if (projectType === "E-commerce") {
    return `${industry.toLowerCase()} products`;
  }

  return `${industry.toLowerCase()} services`;
}

function defaultGoal(projectType) {
  if (projectType === "Landing Page") {
    return "Generate qualified leads";
  }

  if (projectType === "E-commerce") {
    return "Increase online purchases";
  }

  return "Build trust and generate enquiries";
}

function defaultVisualStyle(projectType, industry) {
  if (isHospitalityReference("", industry, "", "", "")) {
    return "premium";
  }

  if (projectType === "Landing Page") {
    return industry.toLowerCase() === "tecnologia" ? "saas-modern-ui" : "premium";
  }

  if (projectType === "E-commerce") {
    return "moderno";
  }

  return industry.toLowerCase() === "servicios" ? "premium" : "editorial";
}

function defaultThemeMode(projectType, industry, visualStyle) {
  if (projectType === "Landing Page" && /(saas|tech|tecnologico|glassmorphism)/.test(visualStyle)) {
    return "Dark";
  }

  if (industry.toLowerCase() === "tecnologia") {
    return "Dark";
  }

  return "Light";
}

function defaultLayoutMode(projectType, industry) {
  if (isHospitalityReference("", industry, "", "", "")) {
    return "block";
  }

  if (projectType === "E-commerce") {
    return "block";
  }

  if (projectType === "Landing Page") {
    return "mixed";
  }

  return "soft";
}

function defaultShellMode(projectType, industry) {
  if (isHospitalityReference("", industry, "", "", "")) {
    return "full-bleed";
  }

  return projectType === "Landing Page" ? "framed-seamless" : "framed";
}

function normalizeLayoutMode(value) {
  const normalized = normalizeToken(value);

  if (["soft", "block", "fluid", "mixed"].includes(normalized)) {
    return normalized;
  }

  if (normalized.includes("full")) {
    return "block";
  }

  return "soft";
}

function normalizeShellMode(value) {
  const normalized = normalizeToken(value);

  if (["framed", "framed seamless", "framed-seamless", "full bleed", "full-bleed", "seamless"].includes(normalized)) {
    return normalized.replace(/\s+/g, "-");
  }

  return "framed";
}

function normalizeTextAlign(value) {
  return normalizeToken(value) === "center" ? "center" : "left";
}

function normalizeButtonShape(value) {
  return normalizeToken(value) === "square" ? "square" : "rounded";
}

function getPalette(industry, projectType) {
  const normalizedIndustry = industry.toLowerCase();

  if (projectType === "E-commerce") {
    return { primary: "#C96B3B", secondary: "#132235" };
  }

  switch (normalizedIndustry) {
    case "tecnologia":
      return { primary: "#3B82F6", secondary: "#0F172A" };
    case "clinica":
      return { primary: "#1D8A8A", secondary: "#103B4A" };
    case "inmobiliaria":
      return { primary: "#C0823C", secondary: "#162033" };
    case "restaurante":
      return { primary: "#C15A2B", secondary: "#2B1C16" };
    case "hoteleria":
    case "hotel":
    case "hospitality":
      return { primary: "#C9A44F", secondary: "#173F7B" };
    default:
      return { primary: "#C96B3B", secondary: "#14304A" };
  }
}

function isHospitalityReference(raw, industry, businessDescription, mainOffer, targetAudience) {
  const source = [raw, industry, businessDescription, mainOffer, targetAudience]
    .join(" ")
    .toLowerCase();

  return /(hotel|hoteler|hostal|hostel|resort|alojamiento|alojar|hosped|habitacion|suite|room|turism|turismo|apart hotel|hospitality)/i.test(source);
}

function splitTitleAndDescription(item) {
  const separators = [":", " - ", " | "];

  for (const separator of separators) {
    const index = item.indexOf(separator);
    if (index > 0) {
      return {
        title: cleanSentence(item.slice(0, index)),
        description: cleanSentence(item.slice(index + separator.length)) || `Support the offer with ${item.slice(0, index).toLowerCase()}.`,
      };
    }
  }

  return {
    title: cleanSentence(item),
    description: `Support the offer with a clearer presentation of ${item.toLowerCase()}.`,
  };
}

function splitFaq(item) {
  const parts = item.split(/\?\s+/);
  if (parts.length >= 2) {
    return {
      question: ensureQuestion(cleanSentence(parts[0])),
      answer: stripWrappingQuotes(cleanSentence(parts.slice(1).join("? "))),
    };
  }

  const [question, answer] = item.split(/\s+-\s+/);
  return {
    question: ensureQuestion(cleanSentence(question)),
    answer: stripWrappingQuotes(cleanSentence(answer || "This can be adapted inside the current reusable website system.")),
  };
}

function splitTestimonial(item, industry, index = 0) {
  const parts = item.split("|").map((part) => cleanSentence(part));

  if (parts.length >= 3) {
    return {
      name: parts[0],
      role: parts[1],
      quote: stripWrappingQuotes(parts.slice(2).join(" | ")),
    };
  }

  const dashParts = item.split(/\s+-\s+/).map((part) => cleanSentence(part));
  if (dashParts.length >= 3) {
    return {
      name: dashParts[0],
      role: dashParts[1],
      quote: stripWrappingQuotes(dashParts.slice(2).join(" - ")),
    };
  }

  const educationFallbacks = [
    ["Familia de Inicial", "Padres de familia"],
    ["Familia de Primaria", "Padres de familia"],
    ["Familia de Secundaria", "Padres de familia"],
  ];
  const normalizedIndustry = normalizeToken(industry);
  if (normalizedIndustry === "education" || normalizedIndustry === "educacion") {
    const [name, role] = educationFallbacks[index] || [`Familia ${index + 1}`, "Padres de familia"];
    return {
      name,
      role,
      quote: stripWrappingQuotes(cleanSentence(item)),
    };
  }

  return {
    name: `${industry === "Education" ? "Padre de familia" : "Cliente"} ${index + 1}`,
    role: industry || "Customer",
    quote: stripWrappingQuotes(cleanSentence(item)),
  };
}

function splitProduct(item) {
  const priceMatch = item.match(/([$€£]\s?\d[\d.,]*)/);
  const parts = item.split("|").map((part) => cleanSentence(part));

  if (parts.length >= 3) {
    return {
      name: parts[0],
      price: parts[1],
      description: parts.slice(2).join(" | "),
    };
  }

  const withoutPrice = item.replace(priceMatch?.[0] ?? "", "").replace(/\s+-\s+-/, " - ");
  const titleAndDescription = splitTitleAndDescription(withoutPrice);

  return {
    name: titleAndDescription.title,
    price: priceMatch?.[0] ?? "From $49",
    description: titleAndDescription.description,
  };
}

function normalizeProjectType(value) {
  const normalized = normalizeToken(value);

  if (normalized.includes("ecommerce") || normalized.includes("store")) {
    return "E-commerce";
  }

  if (normalized.includes("landing")) {
    return "Landing Page";
  }

  return "Website";
}

function normalizeIndustry(value) {
  const normalized = normalizeToken(value);

  if (!normalized) {
    return "Servicios";
  }

  return titleCase(normalized);
}

function normalizeVisualStyle(value) {
  const normalized = normalizeToken(value);

  if (normalized === "catalog light") {
    return "moderno";
  }

  if (normalized === "saas modern ui") {
    return "saas-modern-ui";
  }

  if (normalized === "minimal business") {
    return "minimal-business";
  }

  return normalized.replace(/\s+/g, "-") || "normal";
}

function normalizeThemeMode(value) {
  return normalizeToken(value) === "dark" ? "Dark" : "Light";
}

function normalizeHex(value) {
  const match = String(value || "").trim().match(/^#?[0-9A-Fa-f]{6}$/);
  return match ? `#${match[0].replace("#", "").toUpperCase()}` : "#C96B3B";
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : digits ? `+${digits}` : "";
}

function normalizeToken(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanSentence(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripWrappingQuotes(value) {
  return cleanSentence(value).replace(/^["'“”]+|["'“”]+$/g, "");
}

function ensureQuestion(value) {
  const text = stripWrappingQuotes(value);
  if (!text) {
    return "";
  }

  if (/[?؟]$/.test(text)) {
    return text;
  }

  if (isSpanishText(text)) {
    return `¿${text.replace(/^¿+/, "")}?`;
  }

  return `${text}?`;
}

function firstValue(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() ?? "";
}

function titleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function capitalize(value) {
  const text = cleanSentence(value);
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function shortenPhrase(value, wordLimit) {
  return limitWords(cleanSentence(value), wordLimit);
}

function limitWords(value, wordLimit) {
  return cleanSentence(value).split(" ").slice(0, wordLimit).join(" ");
}

function buildHeroTag(projectType, industry, spanishContent) {
  if (spanishContent) {
    if (projectType === "Landing Page") {
      return "Propuesta principal";
    }

    if (projectType === "E-commerce") {
      return "Catalogo destacado";
    }

    if (normalizeToken(industry) === "education" || normalizeToken(industry) === "educacion") {
      return "Institucion educativa";
    }

    return `Sitio web ${industry.toLowerCase()}`;
  }

  if (projectType === "E-commerce") {
    return `${industry} storefront`;
  }

  return `${industry} website`;
}

function isSpanishText(value) {
  const sample = cleanSentence(value).toLowerCase();
  return /[áéíóúñ¿¡]/i.test(sample) || /\b(el|la|los|las|para|con|que|educacion|servicios|contacto|matriculas|familia|colegio|institucion)\b/i.test(sample);
}
