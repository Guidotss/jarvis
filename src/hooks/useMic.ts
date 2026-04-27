import { useRef } from "react";

export function useMic(onAudio: (blob: Blob) => void) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onAudioRef = useRef(onAudio);
  onAudioRef.current = onAudio;

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const rec = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => {
      onAudioRef.current(new Blob(chunks, { type: "audio/webm" }));
    };
    rec.start();
    recorderRef.current = rec;
  }

  function stop() {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    recorderRef.current = null;
    streamRef.current = null;
  }

  return { start, stop };
}
