import { useState } from "react";

type Props = {
  onSubmit: (text: string) => void;
};

export function TranscriptInput({ onSubmit }: Props) {
  const [value, setValue] = useState("");

  return (
    <div style={{ marginTop: 24 }}>
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        Simulador de transcript (hasta integrar STT):
      </p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='"comenzar el día" · "modo estudio"'
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit(value);
            setValue("");
          }
        }}
        style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
      />
    </div>
  );
}
