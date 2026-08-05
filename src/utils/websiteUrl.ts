"use client";
export const normalizeWebsiteUrl = (value?: string | null) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const withProtocol = /^(https?:)?\/\//i.test(trimmed)
    ? trimmed.startsWith("//")
      ? `https:${trimmed}`
      : trimmed
    : `https://${trimmed}`;

  const tryParse = (input: string) => {
    try {
      const parsed = new URL(input);
      const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
      if (!isHttp || !parsed.hostname) return "";
      return parsed.toString();
    } catch {
      return "";
    }
  };

  return tryParse(withProtocol) || tryParse(encodeURI(withProtocol));
};

