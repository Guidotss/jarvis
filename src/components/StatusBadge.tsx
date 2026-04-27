import type { Status } from "../lib/types";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <p>
      Estado: <strong>{status}</strong>
    </p>
  );
}
