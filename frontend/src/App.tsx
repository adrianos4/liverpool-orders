
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Database,
  RefreshCw,
  Server,
  ShoppingBag,
} from "lucide-react";

import { getSystemStatus } from "./api/systemApi";
import type { SystemStatus } from "./types/system";
import "./App.css";

function App() {
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSystem = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getSystemStatus();
      setSystem(result);
    } catch {
      setSystem(null);
      setError(
        "Unable to connect to the API. Verify that Spring Boot and MongoDB are running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkSystem();
  }, [checkSystem]);

  const apiConnected = system?.status === "UP";
  const databaseConnected = system?.database === "CONNECTED";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Liverpool Orders home">
          <span className="brand-mark">
            <ShoppingBag size={22} />
          </span>
          <span>
            <strong>Liverpool</strong>
            <small>Orders Platform</small>
          </span>
        </a>

        <div className="sidebar-section">
          <span className="nav-heading">WORKSPACE</span>
          <div className="nav-item nav-item-active">
            <Activity size={18} />
            <span>System overview</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <span className="status-dot" />
          Development environment
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">ADMINISTRATION</span>
            <h1>System overview</h1>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={() => void checkSystem()}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "spin" : ""}
            />
            Refresh status
          </button>
        </header>

        <section className="welcome-panel">
          <div>
            <span className="welcome-label">PROJECT FOUNDATION</span>
            <h2>Your order management platform starts here.</h2>
            <p>
              A centralized foundation for managing customers,
              orders, and fulfillment.
            </p>
          </div>
          <div className="welcome-icon" aria-hidden="true">
            <ShoppingBag size={38} />
          </div>
        </section>

        <div className="section-heading">
          <div>
            <h2>Infrastructure health</h2>
            <p>Live status from your local development environment.</p>
          </div>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        <div className="status-grid">
          <article className="status-card">
            <div className="card-top">
              <span className="card-icon">
                <Server size={21} />
              </span>
              <span
                className={`status-pill ${
                  apiConnected ? "status-good" : "status-pending"
                }`}
              >
                {loading
                  ? "Checking"
                  : apiConnected
                    ? "Connected"
                    : "Unavailable"}
              </span>
            </div>
            <h3>Spring Boot API</h3>
            <p>REST service</p>
            <div className="card-bottom">
              <span>localhost:8080</span>
              <ArrowUpRight size={16} />
            </div>
          </article>

          <article className="status-card">
            <div className="card-top">
              <span className="card-icon">
                <Database size={21} />
              </span>
              <span
                className={`status-pill ${
                  databaseConnected
                    ? "status-good"
                    : "status-pending"
                }`}
              >
                {loading
                  ? "Checking"
                  : databaseConnected
                    ? "Connected"
                    : "Unavailable"}
              </span>
            </div>
            <h3>MongoDB</h3>
            <p>Document database</p>
            <div className="card-bottom">
              <span>liverpool_orders</span>
              <ArrowUpRight size={16} />
            </div>
          </article>
        </div>

        <section className="next-step-panel">
          <div className="next-step-icon">
            <Activity size={20} />
          </div>
          <div>
            <h3>Next: customer and order management</h3>
            <p>
              The next phase introduces domain models, repositories,
              business services, and REST endpoints.
            </p>
          </div>
        </section>

        <footer className="page-footer">
          <span>Liverpool Orders · Development</span>
          <span>
            {system?.timestamp
              ? `Last checked: ${new Date(
                  system.timestamp
                ).toLocaleTimeString()}`
              : "Waiting for system status"}
          </span>
        </footer>
      </section>
    </main>
  );
}

export default App;
