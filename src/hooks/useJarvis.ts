import { useState } from "react";
import type { LogEntry, LogKind, Status } from "../lib/types";
import { parseCommand } from "../lib/intent";
import { openApp, runRoutine, transcribe } from "../lib/commands";
import { useMic } from "./useMic";

const LOG_LIMIT = 30;

export function useJarvis() {
  const [status, setStatus] = useState<Status>("idle");
  const [log, setLog] = useState<LogEntry[]>([]);

  function push(kind: LogKind, text: string) {
    setLog((l) =>
      [{ id: crypto.randomUUID(), kind, text, ts: Date.now() }, ...l].slice(
        0,
        LOG_LIMIT,
      ),
    );
  }

  const mic = useMic(async (blob) => {
    if (blob.size === 0) {
      setStatus("idle");
      return;
    }
    setStatus("processing");
    const kb = Math.round(blob.size / 1024);
    push("system", `Audio capturado (${kb} KB) — transcribiendo...`);
    try {
      const text = await transcribe(blob);
      if (!text) {
        push("system", "No se detectó voz");
        setStatus("idle");
        return;
      }
      await dispatch(text);
    } catch (e) {
      setStatus("error");
      push("error", `STT: ${String(e)}`);
    }
  });

  async function start() {
    try {
      await mic.start();
      setStatus("listening");
      push("system", "Escuchando...");
    } catch (e) {
      setStatus("error");
      push("error", `Error de micrófono: ${String(e)}`);
    }
  }

  function stop() {
    mic.stop();
  }

  async function dispatch(transcript: string) {
    if (!transcript.trim()) return;
    setStatus("processing");
    push("user", transcript);
    const parsed = parseCommand(transcript);
    try {
      if (parsed.type === "routine") {
        const apps = await runRoutine(parsed.payload);
        push("success", `Rutina ${parsed.payload}: ${apps.join(", ")}`);
      } else if (parsed.type === "open") {
        const res = await openApp(parsed.payload);
        push("success", res.message);
      } else {
        push("system", "No entendí el comando");
      }
      setStatus("executed");
    } catch (e) {
      setStatus("error");
      push("error", String(e));
    }
  }

  return { status, log, start, stop, dispatch };
}
