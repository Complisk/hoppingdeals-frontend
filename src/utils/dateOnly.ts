"use client";
const DATE_ONLY_PREFIX_REGEX = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/;

export const parseDateOnlyToLocal = (
  value?: string | Date | null,
): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const raw = String(value).trim();
  const match = raw.match(DATE_ONLY_PREFIX_REGEX);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(year, month, day);
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};
