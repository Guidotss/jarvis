import { useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type Status = "idle" | "listening" | "processing" | "executed" | "error";

const ROUTINE_KEYWORDS: Record<string, string> = {
  "comenzar el dia": "comenzar-dia",
  "comenzar el día": "comenzar-dia",
  "modo estudio": "modo-estudio",
};

type Parsed =
  | { type: "routine"; payload: string }
  | { type: "open"; payload: string }
  | { type: "none" };

function parseCommand(transcript: string): Parsed {
  const t = transcript.toLowerCase().trim();
  for (const [kw, routine] of Object.entries(ROUTINE_KEYWORDS)) {
    if (t.includes(kw)) return { type: "routine", payload: routine };
  }
  const m = t.match(/^abrir\s+(.+)$/);
  if (m) return { type: "open", payload: m[1].trim() };
  return { type: "none" };
}

export default function App() {
  const [status, setStatus] = useState<Status>("idle");
  const [log, setLog] = useState<string[]>([]);
  const [manual, setManual] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const push = (line: string) => setLog((l) => [line, ...l].slice(0, 30));

  async function startListening() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        push(`🎧 Audio capturado (${Math.round(blob.size / 1024)} KB) — pendiente STT`);
        // TODO: enviar `blob` a Whisper (API o local) y llamar a handleTranscript(texto)
      };
      rec.start();
      recorderRef.current = rec;
      setStatus("listening");
      push("🎙️ Escuchando...");
    } catch (e) {
      setStatus("error");
      push(`❌ Error de micrófono: ${String(e)}`);
    }
  }

  function stopListening() {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    recorderRef.current = null;
    streamRef.current = null;
    setStatus("idle");
  }

  async function handleTranscript(transcript: string) {
    if (!transcript.trim()) return;
    setStatus("processing");
    push(`🗣️ "${transcript}"`);
    const parsed = parseCommand(transcript);
    try {
      if (parsed.type === "routine") {
        const apps = await invoke<string[]>("run_routine", { name: parsed.payload });
        push(`✅ Rutina ${parsed.payload}: ${apps.join(", ")}`);
      } else if (parsed.type === "open") {
        const res = await invoke<{ message: string }>("open_app", { name: parsed.payload });
        push(`✅ ${res.message}`);
      } else {
        push("⚠️ No entendí el comando");
      }
      setStatus("executed");
    } catch (e) {
      setStatus("error");
      push(`❌ ${String(e)}`);
    }
  }

  return (
    <main className="container">
      <h1>Jarvis</h1>
      <p>
        Estado: <strong>{status}</strong>
      </p>

      <button
        className={`mic ${status === "listening" ? "active" : ""}`}
        onClick={status === "listening" ? stopListening : startListening}
      >
        {status === "listening" ? "⏹ Detener" : "🎙 Iniciar escucha"}
      </button>

      <div style={{ marginTop: 24 }}>
        <p style={{ fontSize: 12, opacity: 0.7 }}>
          Simulador de transcript (hasta integrar STT):
        </p>
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder='"comenzar el día" · "abrir Slack" · "modo estudio"'
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleTranscript(manual);
              setManual("");
            }
          }}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
      </div>

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
        {log.map((line, i) => (
          <li key={i} style={{ padding: "2px 0" }}>
            {line}
          </li>
        ))}
      </ul>
    </main>
  );
}
