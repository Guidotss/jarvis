import type { Parsed } from "./types";

const ROUTINE_KEYWORDS: Record<string, string> = {
  "comenzar el dia": "comenzar-dia",
  "comenzar el día": "comenzar-dia",
  "modo estudio": "modo-estudio",
};

export function parseCommand(transcript: string): Parsed {
  const t = transcript.toLowerCase().trim();
  for (const [kw, routine] of Object.entries(ROUTINE_KEYWORDS)) {
    if (t.includes(kw)) return { type: "routine", payload: routine };
  }
  const m = t.match(/^abrir\s+(.+)$/);
  if (m) return { type: "open", payload: m[1].trim() };
  return { type: "none" };
}
