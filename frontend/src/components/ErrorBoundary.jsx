import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import TrustVaultLogo from "./TrustVaultLogo";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("TrustVault ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem("trustvault_page");
    } catch {}
    window.location.href = "/";
  };

  handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d1117",
          color: "#e6edf3",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
          textAlign: "center"
        }}>
          <div style={{
            maxWidth: "520px",
            width: "100%",
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <TrustVaultLogo size={42} showSub={false} />
            </div>

            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "16px"
            }}>
              <AlertTriangle size={16} />
              Runtime Shield Recovered
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 10px 0" }}>
              Session Resiliency Activated
            </h2>
            <p style={{ fontSize: "14px", color: "#8b949e", margin: "0 0 24px 0", lineHeight: "1.5" }}>
              An unexpected interface anomaly was intercepted by TrustVault's defensive integrity layer.
              Your cryptographic credentials and backend data remain completely intact.
            </p>

            {this.state.error && (
              <div style={{
                textAlign: "left",
                backgroundColor: "#0d1117",
                border: "1px solid #21262d",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "12px",
                color: "#ff7b72",
                fontFamily: "monospace",
                marginBottom: "24px",
                overflowX: "auto"
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  backgroundColor: "#238636",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <RotateCcw size={16} />
                Reload Portal
              </button>

              <button
                onClick={this.handleHardReset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  backgroundColor: "#21262d",
                  color: "#c9d1d9",
                  border: "1px solid #30363d",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                <Home size={16} />
                Reset & Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
