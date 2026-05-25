type DescriptionEntry = {
  body?: string | null;
  excerpt?: string | null;
};

const leadNoisePatterns = [
  /^add\s+to\s+site\s*[:\-–—]?\s*/i,
  /^one\s+line\s*[:\-–—]?\s*/i,
  /^the\s+problem\s*[:\-–—]?\s*/i,
];

export function getEntryDescription(entry: DescriptionEntry, fallback = "Read the latest ZIDER guide.", maxLength = 165) {
  const rawValue = entry.excerpt || excerptFromBody(entry.body) || fallback;
  return truncateDescription(cleanDescription(rawValue), maxLength);
}

function cleanDescription(value: string) {
  let cleanedValue = stripHtml(value)
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .replace(/([.!?])(?=[A-Z])/g, "$1 ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\.{3,}$/g, "")
    .trim();

  for (const pattern of leadNoisePatterns) {
    cleanedValue = cleanedValue.replace(pattern, "");
  }

  return cleanedValue.replace(/\s+/g, " ").trim();
}

function truncateDescription(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const clippedValue = value.slice(0, maxLength + 1);
  const lastSentenceBreak = Math.max(clippedValue.lastIndexOf(". "), clippedValue.lastIndexOf("! "), clippedValue.lastIndexOf("? "));
  const shouldEndAtSentence = lastSentenceBreak > maxLength * 0.54;
  const lastWordBreak = clippedValue.lastIndexOf(" ");
  const endIndex = shouldEndAtSentence ? lastSentenceBreak + 1 : lastWordBreak;
  const trimmedValue = clippedValue.slice(0, Math.max(0, endIndex)).replace(/[,\-–—:;]+$/g, "").trim();
  const fallbackValue = value.slice(0, maxLength).trim();
  const finalValue = (trimmedValue || fallbackValue).replace(/\.{3,}$/g, "").trim();

  return shouldEndAtSentence && /[.!?]$/.test(finalValue) ? finalValue : `${finalValue}...`;
}

function excerptFromBody(body: string | null | undefined) {
  if (!body) {
    return "";
  }

  return stripHtml(body).slice(0, 260);
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}
