# TrustVault — Enterprise Zero-Trust Document Enclave

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20AWS-336791.svg)](https://neon.tech/)
[![Deployment](https://img.shields.io/badge/Deployed-Vercel%20%2B%20Render-black.svg)](https://frontend-roan-three-7fqlz5ax9a.vercel.app/)

> **TrustVault** is a production-ready **Zero-Trust Document Custody & Integrity Verification Enclave**. Built on the principle of *"Never trust, always verify"*, it safeguards confidential enterprise documents using automated SHA-256 cryptographic hashing, fine-grained multi-role access controls, isolated in-browser watermarking, and tamper-evident PostgreSQL audit ledgers.

---

## 🌐 Live Deployments & Demo

* **Web Application (Vercel Global Edge CDN):**  
  👉 [https://frontend-roan-three-7fqlz5ax9a.vercel.app/](https://frontend-roan-three-7fqlz5ax9a.vercel.app/)
* **Cryptographic API Enclave (Render Cloud Web Service):**  
  👉 [https://trustvault-blgr.onrender.com/](https://trustvault-blgr.onrender.com/)
* **Serverless Database (Neon AWS us-east-2):**  
  Connected via pooled PostgreSQL with SSL/TLS (`sslmode=require`).
* **Drive Video Walkthrough & Demo:**  
  👉 [https://drive.google.com/file/d/1Z58RU3GtgX03tgs9UZniI6WDng1vNSuG/view?usp=drive_link](https://drive.google.com/file/d/1Z58RU3GtgX03tgs9UZniI6WDng1vNSuG/view?usp=drive_link)
* **Note:
  The project walkthrough is hosted on Canva because the video exceeded the practical upload limits I encountered on YouTube, and Canva provided a convenient way to showcase the full demonstration.
  
---

## 🔑 Important Notice: Email Delivery & Default OTP Generation

> [!IMPORTANT]
> **Live Email Dispatch is Bypassed — Default OTP is Auto-Generated:**  
> - **External Email Delivery is Disabled:** Due to cloud firewall restrictions and SMTP port blocking on free cloud tiers, live emails are **not** sent to external inboxes.  
> - **Default / Auto-Generated OTP:** For testing and evaluation, TrustVault automatically generates the 6-digit verification code and **pre-fills / displays it directly on the login screen**. You can proceed through 2FA immediately without checking an email inbox.

### Quick Demo & Test Credentials
* **Administrator:** `admin123@gmail.com` | Password: `admin123` *(Bypasses OTP, logs in directly)*
* **Document Owner:** `owner2@example.com` | Password: `owner123` *(OTP is auto-generated & pre-filled)*
* **Authorized Viewer:** `viewer1@example.com` | Password: `viewer123` *(OTP is auto-generated & pre-filled)*  
*(You can also click the quick role preview cards on the landing page to test all three dashboards).*

---

## 🛡️ Core Capabilities

1. **Explicit Identity & Worker IDs:**  
   Every authenticated identity is assigned a deterministic Worker ID (`TV-USR-xxxx`). Unapproved signups are gated behind a `PENDING_APPROVAL` authorization barrier with a sandboxed read-only preview mode.
2. **Cryptographic Ingestion & Verification:**  
   Documents ingested into TrustVault are hashed with SHA-256 upon reception. Tamper detection compares hashes before and during dispatch.
3. **Multi-Role Clearance Controls:**  
   - **Viewer:** Request clearance, browse permitted documents, and open watermarked isolated previews.
   - **Document Owner:** Ingest documents, review access requests, delegate permissions with instant viewer email autocomplete, and manage soft-deletion.
   - **Administrator:** Platform-wide oversight, user status governance (Approve / Revoke / Restore), global document management, real-time viewer access request approval, and complete audit log telemetry.
4. **Universal "Other" Ingestion Mode:**  
   Supports PDF, Word, Excel, and universal "Other" mode (allowing arbitrary files, secure notes, or URLs with automatic UTF-8 byte size calculation and type defaulting to Text).
5. **Instant Revocation Protocol:**  
   Revoked accounts are instantly cut off across all endpoints with immediate session termination.
6. **Tamper-Evident Audit Ledger:**  
   Every login, document upload, permission delegation, and deletion is recorded in an immutable PostgreSQL audit trail with exact calendar dates and local timestamps.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Java 21+ (OpenJDK / Temurin)
- Node.js 20+ & npm
- PostgreSQL (or Neon cloud connection string)

### 1. Run the Spring Boot Backend (Port 8080)
```powershell
cd trustvault-backend
.\mvnw.cmd spring-boot:run
```
*Backend URL:* `http://localhost:8080`

### 2. Run the React + Vite Frontend (Port 5173)
```powershell
cd frontend
npm install
npm run dev
```
*Frontend URL:* `http://localhost:5173`

---

## 🐳 Docker Deployment

Run the complete multi-cloud stack locally with Docker Compose:
```bash
docker-compose up --build
```
Or build the lean production container:
```bash
docker build -t trustvault:latest .
docker run -p 8080:8080 trustvault:latest
```

---

## 🔒 Security & Threat Modeling

Comprehensive threat assessments, attack vectors, and automated test validations are documented in:
* **[THREATS.md](THREATS.md)** — STRIDE threat matrix, DREAD scoring, and automated test cross-references.
* **[PROMPTS.md](PROMPTS.md)** — Chronological engineering log, critical security catches, and commit traces.
