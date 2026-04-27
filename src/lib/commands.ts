import { invoke } from "@tauri-apps/api/core";

export async function openApp(name: string): Promise<{ message: string }> {
  return invoke("open_app", { name });
}

export async function runRoutine(name: string): Promise<string[]> {
  return invoke("run_routine", { name });
}
