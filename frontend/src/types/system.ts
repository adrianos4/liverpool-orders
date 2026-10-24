
export interface SystemStatus {
  application: string;
  timestamp: string;
  status: "UP" | "DEGRADED";
  database: "CONNECTED" | "DISCONNECTED";
  message?: string;
}
