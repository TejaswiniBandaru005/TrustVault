package com.trustvault;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> rootLanding(
            @RequestHeader(value = "Accept", defaultValue = "") String acceptHeader) {
        
        // If client specifically asks for JSON (e.g. curl or API test tool)
        if (acceptHeader.contains("application/json")) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"status\":\"UP\",\"app\":\"TrustVault Cryptographic Backend\",\"port\":8080,\"frontendUrl\":\"http://localhost:5173\",\"timestamp\":\"" + Instant.now() + "\"}");
        }

        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>TrustVault - Backend Cryptographic Enclave</title>
              <style>
                :root {
                  --bg: #090d16;
                  --card: #111827;
                  --border: #1e293b;
                  --primary: #3b82f6;
                  --primary-glow: rgba(59, 130, 246, 0.25);
                  --text: #f8fafc;
                  --muted: #94a3b8;
                  --success: #10b981;
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  background-color: var(--bg);
                  color: var(--text);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 24px;
                }
                .container {
                  max-width: 640px;
                  width: 100%;
                  background: var(--card);
                  border: 1px solid var(--border);
                  border-radius: 20px;
                  padding: 40px;
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
                  text-align: center;
                  position: relative;
                  overflow: hidden;
                }
                .glow {
                  position: absolute;
                  top: -80px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 240px;
                  height: 120px;
                  background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
                  filter: blur(24px);
                  pointer-events: none;
                }
                .shield-icon {
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  width: 64px;
                  height: 64px;
                  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                  border-radius: 16px;
                  color: white;
                  font-size: 30px;
                  margin-bottom: 20px;
                  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
                }
                h1 {
                  font-size: 26px;
                  font-weight: 800;
                  letter-spacing: -0.02em;
                  margin-bottom: 8px;
                }
                .subheading {
                  color: var(--muted);
                  font-size: 14px;
                  margin-bottom: 24px;
                  line-height: 1.6;
                }
                .status-badge {
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  padding: 8px 18px;
                  background: rgba(16, 185, 129, 0.12);
                  border: 1px solid rgba(16, 185, 129, 0.3);
                  border-radius: 999px;
                  color: var(--success);
                  font-size: 13px;
                  font-weight: 600;
                  margin-bottom: 30px;
                }
                .dot {
                  width: 8px;
                  height: 8px;
                  background-color: var(--success);
                  border-radius: 50%;
                  box-shadow: 0 0 10px var(--success);
                }
                .cta-box {
                  background: rgba(15, 23, 42, 0.8);
                  border: 1px solid var(--border);
                  border-radius: 14px;
                  padding: 24px;
                  margin-bottom: 28px;
                }
                .cta-box p {
                  color: var(--muted);
                  font-size: 14px;
                  margin-bottom: 16px;
                }
                .btn {
                  display: inline-flex;
                  align-items: center;
                  gap: 10px;
                  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                  color: white;
                  text-decoration: none;
                  font-weight: 600;
                  font-size: 15px;
                  padding: 12px 28px;
                  border-radius: 10px;
                  box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.5);
                  transition: all 0.2s ease;
                }
                .btn:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.6);
                }
                .endpoints-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 10px;
                  text-align: left;
                  font-size: 12px;
                }
                .endpoint-card {
                  background: rgba(30, 41, 59, 0.5);
                  border: 1px solid var(--border);
                  border-radius: 8px;
                  padding: 10px 14px;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                }
                .endpoint-path {
                  color: #60a5fa;
                  font-family: monospace;
                  font-weight: 600;
                }
                .endpoint-desc {
                  color: var(--muted);
                  font-size: 11px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="glow"></div>
                <div class="shield-icon">🛡️</div>
                <h1>TrustVault Cryptographic Enclave</h1>
                <p class="subheading">
                  High-Security Document Custody & Zero-Trust Verification Engine
                </p>
                <div class="status-badge">
                  <span class="dot"></span>
                  Port 8080 Active &middot; PostgreSQL Connected &middot; Neon AWS
                </div>

                <div class="cta-box">
                  <p>
                    Looking for the TrustVault Interactive Web Interface?
                    The Web Portal runs on port <strong>5173</strong>.
                  </p>
                  <a href="http://localhost:5173" class="btn">
                    Launch TrustVault Web App &rarr;
                  </a>
                </div>

                <div class="endpoints-grid">
                  <div class="endpoint-card">
                    <span class="endpoint-path">GET /api/health</span>
                    <span class="endpoint-desc">Live health and uptime telemetry</span>
                  </div>
                  <div class="endpoint-card">
                    <span class="endpoint-path">POST /api/auth/**</span>
                    <span class="endpoint-desc">Worker ID, OTP & session tokens</span>
                  </div>
                  <div class="endpoint-card">
                    <span class="endpoint-path">ALL /api/documents/**</span>
                    <span class="endpoint-desc">Encrypted document store & trash</span>
                  </div>
                  <div class="endpoint-card">
                    <span class="endpoint-path">ALL /api/admin/**</span>
                    <span class="endpoint-desc">Owner history & account governance</span>
                  </div>
                </div>
              </div>
            </body>
            </html>
            """;

        return ResponseEntity.ok(html);
    }

    @GetMapping(value = "/api/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> checkHealth() {
        return Map.of(
                "status", "UP",
                "application", "TrustVault Cryptographic Enclave",
                "port", 8080,
                "frontendUrl", "http://localhost:5173",
                "timestamp", Instant.now().toString(),
                "database", "PostgreSQL (AWS Neon)",
                "softDeleteEngine", "Active"
        );
    }
}
