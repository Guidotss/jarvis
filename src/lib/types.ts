export type Status = "idle" | "listening" | "processing" | "executed" | "error";

export type Parsed =
  | { type: "routine"; payload: string }
  | { type: "none" };

export type LogKind = "user" | "system" | "success" | "error";

export type LogEntry = {
  id: string;
  kind: LogKind;
  text: string;
  ts: number;
};
