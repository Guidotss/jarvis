import type { LogEntry, LogKind } from "../lib/types";

const ICON: Record<LogKind, string> = {
  user: "🗣️",
  system: "ℹ️",
  success: "✅",
  error: "❌",
};

export function EventLog({ entries }: { entries: LogEntry[] }) {
  return (
    <ul
      style={{
        textAlign: "left",
        marginTop: 24,
        fontFamily: "ui-monospace, monospace",
        fontSize: 13,
        listStyle: "none",
        padding: 0,
      }}
    >
      {entries.map((e) => (
        <li key={e.id} style={{ padding: "2px 0" }}>
          {ICON[e.kind]} {e.text}
        </li>
      ))}
    </ul>
  );
}
