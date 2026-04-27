import "./styles/App.css";
import { useJarvis } from "./hooks/useJarvis";
import { MicButton } from "./components/MicButton";
import { StatusBadge } from "./components/StatusBadge";
import { TranscriptInput } from "./components/TranscriptInput";
import { EventLog } from "./components/EventLog";

export default function App() {
  const { status, log, start, stop, dispatch } = useJarvis();

  return (
    <main className="container">
      <h1>Jarvis</h1>
      <StatusBadge status={status} />
      <MicButton status={status} onStart={start} onStop={stop} />
      <TranscriptInput onSubmit={dispatch} />
      <EventLog entries={log} />
    </main>
  );
}
