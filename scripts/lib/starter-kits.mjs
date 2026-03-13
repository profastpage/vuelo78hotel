import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const starterKitsPath = path.join(root, "config", "starter-kits.json");

let cachedStarterKits = null;

export function getStarterKits() {
  if (cachedStarterKits) {
    return cachedStarterKits;
  }

  const raw = fs.readFileSync(starterKitsPath, "utf8").replace(/^\uFEFF/, "");
  const parsed = JSON.parse(raw);
  cachedStarterKits = Array.isArray(parsed.kits) ? parsed.kits : [];
  return cachedStarterKits;
}

export function getStarterKitByKey(key) {
  const normalizedKey = normalizeToken(key).replace(/\s+/g, "-");
  return getStarterKits().find((kit) => kit.key === normalizedKey) || null;
}

export function inferStarterKit(signals) {
  const normalizedProjectType = normalizeProjectType(signals.projectType);
  const source = [
    signals.industry,
    signals.mainOffer,
    signals.businessDescription,
    signals.targetAudience,
    signals.businessName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let bestKit = null;
  let bestScore = -1;

  for (const kit of getStarterKits()) {
    const projectTypes = Array.isArray(kit.match?.projectTypes) ? kit.match.projectTypes : [];
    const keywords = Array.isArray(kit.match?.keywords) ? kit.match.keywords : [];
    let score = 0;

    if (projectTypes.includes(normalizedProjectType)) {
      score += 4;
    }

    for (const keyword of keywords) {
      if (source.includes(String(keyword).toLowerCase())) {
        score += 3;
      }
    }

    if (normalizedProjectType === "E-commerce" && /(saas|ai|tool|finance|fintech)/i.test(source)) {
      score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestKit = kit;
    }
  }

  if (bestKit) {
    return bestKit;
  }

  if (normalizedProjectType === "E-commerce") {
    return getStarterKitByKey("fintech-trust") || getStarterKits()[0] || null;
  }

  if (/(saas|software|crm|automation|ops|dashboard)/i.test(source)) {
    return getStarterKitByKey("saas-ops") || getStarterKits()[0] || null;
  }

  return getStarterKitByKey("luxury-service") || getStarterKits()[0] || null;
}

export function buildPremiumContext(signals) {
  const starterKit = signals.starterKit || inferStarterKit(signals);
  const recommendedSequence = Array.isArray(signals.recommendedSequence)
    ? signals.recommendedSequence.filter(Boolean)
    : [];

  if (!starterKit) {
    return {
      starterKitKey: "",
      starterKitLabel: "",
      strategy: {
        brandThesis: "Presentar la oferta con mayor claridad, identidad y jerarquia desde el primer viewport.",
        positioning: "Oferta clara, creible y lista para convertir.",
        proofAngle: "Prueba social, beneficios y CTA visibles.",
        ctaStrategy: "CTA principal visible en hero y cierre.",
        artDirection: "Direccion visual premium y comercial, sin patrones genericos.",
        recommendedSequence,
      },
      designSystem: {
        starterKit: "",
        typographySystem: "display + ui sans",
        densityProfile: "balanced premium",
        motionProfile: "subtle staged reveal",
        surfaceProfile: "layered premium shells",
      },
      scorecardTargets: {
        visual: 88,
        conversion: 86,
        trust: 88,
        responsive: 94,
        content: 88,
      },
    };
  }

  return {
    starterKitKey: starterKit.key,
    starterKitLabel: starterKit.label,
    strategy: {
      brandThesis: starterKit.brand?.brandThesis || "",
      positioning: starterKit.brand?.positioning || "",
      proofAngle: starterKit.brand?.proofAngle || "",
      ctaStrategy: starterKit.brand?.ctaStrategy || "",
      artDirection: starterKit.brand?.artDirection || "",
      recommendedSequence,
    },
    designSystem: {
      starterKit: starterKit.key,
      typographySystem: starterKit.designSystem?.typography || "",
      densityProfile: starterKit.designSystem?.density || "",
      motionProfile: starterKit.designSystem?.motion || "",
      surfaceProfile: starterKit.designSystem?.surface || "",
    },
    scorecardTargets: starterKit.scorecardTargets || {
      visual: 88,
      conversion: 86,
      trust: 88,
      responsive: 94,
      content: 88,
    },
  };
}

function normalizeProjectType(projectType) {
  const normalized = normalizeToken(projectType);
  if (normalized === "website" || normalized === "web site") {
    return "Website";
  }
  if (normalized === "landing page") {
    return "Landing Page";
  }
  if (normalized === "e commerce" || normalized === "e-commerce" || normalized === "ecommerce") {
    return "E-commerce";
  }
  return projectType || "Website";
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
