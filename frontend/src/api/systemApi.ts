
import type { SystemStatus } from "../types/system";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export async function getSystemStatus(): Promise<SystemStatus> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/system/status`
  );

  if (!response.ok) {
    throw new Error(
      `Unable to retrieve system status (HTTP ${response.status})`
    );
  }

  return (await response.json()) as SystemStatus;
}
