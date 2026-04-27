import type { Status } from "../lib/types";

type Props = {
  status: Status;
  onStart: () => void;
  onStop: () => void;
};

export function MicButton({ status, onStart, onStop }: Props) {
  const listening = status === "listening";
  return (
    <button
      className={`mic ${listening ? "active" : ""}`}
      onClick={listening ? onStop : onStart}
    >
      {listening ? "⏹ Detener" : "🎙 Iniciar escucha"}
    </button>
  );
}
