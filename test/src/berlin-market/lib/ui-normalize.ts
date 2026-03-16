import type { UI } from "@/lib/supabase";

const coerceStringArray = (value: unknown): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    // En algunos casos jsonb puede venir como string ("[\"url1\",\"url2\"]")
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
        }
      } catch {
        // fallback: tratar como URL única
      }
    }

    return [trimmed];
  }

  return [];
};

const coercePopup = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) return typeof value[0] === "string" ? (value[0].trim() || null) : null;
  return null;
};

export const normalizeUIRecord = (ui: any): UI => {
  return {
    ...ui,
    banner: coerceStringArray(ui?.banner),
    hiddenbanner: coerceStringArray(ui?.hiddenbanner),
    popup: coercePopup(ui?.popup),
  };
};

export const normalizeUIRecords = (records: any[]): UI[] => {
  return (records || []).map(normalizeUIRecord);
};

