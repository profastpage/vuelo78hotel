import type { ReactNode } from "react";

function normalizeHeadline(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

type SplitHeadlineOptions = {
  singleLineWordThreshold: number;
  singleLineCharThreshold: number;
  singleLineWordLimit?: number;
  singleLineCharLimit?: number;
  minWordsPerLine?: number;
};

function splitBalancedHeadline(value: string, options: SplitHeadlineOptions) {
  const normalized = normalizeHeadline(value);
  if (!normalized) {
    return [""];
  }

  const words = normalized.split(" ");
  const minWordsPerLine = options.minWordsPerLine ?? 2;

  if (words.length <= options.singleLineWordThreshold || normalized.length <= options.singleLineCharThreshold) {
    return [normalized];
  }

  if (
    typeof options.singleLineWordLimit === "number" &&
    typeof options.singleLineCharLimit === "number" &&
    words.length <= options.singleLineWordLimit &&
    normalized.length <= options.singleLineCharLimit
  ) {
    return [normalized];
  }

  let bestIndex = 0;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let index = minWordsPerLine; index <= words.length - minWordsPerLine; index += 1) {
    const firstLine = words.slice(0, index).join(" ");
    const secondLine = words.slice(index).join(" ");
    const balancePenalty = Math.abs(firstLine.length - secondLine.length);
    const shortTailPenalty = secondLine.length < Math.max(10, firstLine.length * 0.5) ? 18 : 0;
    const longFirstLinePenalty = firstLine.length > secondLine.length * 1.65 ? 12 : 0;
    const score = balancePenalty + shortTailPenalty + longFirstLinePenalty;

    if (score < bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  if (!bestIndex) {
    return [normalized];
  }

  return [words.slice(0, bestIndex).join(" "), words.slice(bestIndex).join(" ")];
}

export function splitHeroHeadline(value: string) {
  return splitBalancedHeadline(value, {
    singleLineWordThreshold: 3,
    singleLineCharThreshold: 24,
    singleLineWordLimit: 4,
    singleLineCharLimit: 30,
    minWordsPerLine: 2,
  });
}

export function splitSectionTitle(value: string) {
  return splitBalancedHeadline(value, {
    singleLineWordThreshold: 5,
    singleLineCharThreshold: 38,
    singleLineWordLimit: 6,
    singleLineCharLimit: 46,
    minWordsPerLine: 2,
  });
}

export function renderBalancedHeroHeadline(value: string): ReactNode {
  const lines = splitHeroHeadline(value);
  if (lines.length <= 1) {
    return value;
  }

  return lines.map((line, index) => (
    <span className="hero-title-line" key={`${line}-${index}`}>
      {line}
    </span>
  ));
}

export function renderBalancedSectionTitle(value: string): ReactNode {
  const lines = splitSectionTitle(value);
  if (lines.length <= 1) {
    return value;
  }

  return lines.map((line, index) => (
    <span className="section-title-line" key={`${line}-${index}`}>
      {line}
    </span>
  ));
}
