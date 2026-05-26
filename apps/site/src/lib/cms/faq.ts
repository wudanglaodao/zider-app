export type CmsFaqItem = {
  answer: string;
  question: string;
};

const faqBlockPattern = /<!--\s*zider-faq:v1:([A-Za-z0-9_-]+)\s*-->/g;

export function extractCmsFaqItems(body: string | null | undefined): CmsFaqItem[] {
  const matches = [...(body ?? "").matchAll(faqBlockPattern)];
  const encodedValue = matches.at(-1)?.[1];

  if (!encodedValue) {
    return [];
  }

  try {
    const decodedValue = Buffer.from(encodedValue, "base64url").toString("utf8");
    const parsedValue = JSON.parse(decodedValue);

    return normalizeFaqItems(parsedValue);
  } catch {
    return [];
  }
}

export function stripCmsFaqBlock(body: string | null | undefined) {
  return (body ?? "").replace(faqBlockPattern, "").trim();
}

export function applyCmsFaqItemsToBody(body: string | null | undefined, faqItems: CmsFaqItem[]) {
  const cleanedBody = stripCmsFaqBlock(body);
  const normalizedItems = normalizeFaqItems(faqItems);

  if (!normalizedItems.length) {
    return cleanedBody;
  }

  return `${cleanedBody}\n\n${serializeFaqItems(normalizedItems)}`.trim();
}

export function parseCmsFaqInput(value: string) {
  if (!value.trim()) {
    return [];
  }

  try {
    return normalizeFaqItems(JSON.parse(value));
  } catch {
    return [];
  }
}

function serializeFaqItems(items: CmsFaqItem[]) {
  return `<!-- zider-faq:v1:${Buffer.from(JSON.stringify(items), "utf8").toString("base64url")} -->`;
}

function normalizeFaqItems(value: unknown): CmsFaqItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as Partial<CmsFaqItem>;
      const question = normalizeFaqText(candidate.question);
      const answer = normalizeFaqText(candidate.answer);

      return question && answer
        ? {
            answer,
            question,
          }
        : null;
    })
    .filter((item): item is CmsFaqItem => Boolean(item))
    .slice(0, 12);
}

function normalizeFaqText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 1_000) : "";
}
