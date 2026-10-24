# TrustVault Zero-Trust Document Enclave — Threat Model & Security Architecture

> **Security Document Version:** 2.4.0  
> **Classification:** Confidential / Enterprise Architecture  
> **Framework:** STRIDE Threat Matrix & DREAD Risk Assessment Methodology  
> **Target System:** TrustVault Document Custody & Clearance Enclave (Spring Boot 4.1 + React 19 + PostgreSQL)

---

## 1. Executive Summary & Zero-Trust Principles

**TrustVault** is engineered on the core tenet of **Zero Trust**: *"Never trust, always verify"*. No user, device, network, or process is inherently trusted, regardless of origin or access location.

### Core Architectural Axioms
1. **Explicit Identity Verification:** Every interaction requires cryptographic proof of identity. Authenticated users are assigned an immutable Worker ID (`TV-USR-xxxx`).
2. **Least Privilege Enclave Access:** Access to documents is denied by default. Clearances are scoped (`View only` vs `View + Download`) and bounded by strict expiration timestamps (`expiresAt`).
3. **Cryptographic Data Integrity:** All stored documents are validated via SHA-256 cryptographic hashing to ensure zero file tampering or silent bit rot.
4. **Assume Breach & Complete Auditability:** Every lifecycle event (login, view, download, permission grant, revocation, soft-deletion) is committed to an append-only audit log.

---

## 2. Trust Boundaries & Data Flow Diagram (DFD)

```
       [ Public Untrusted Zone ]
                 │
                 │ HTTPS / TLS 1.3
                 ▼
    ┌─────────────────────────┐
    │  TrustVault Web Client  │ ──> In-Browser Watermarked Isolation Reader
    │   (React 19 / TS / UI)  │
    └─────────────────────────┘
                 │
                 │ REST API / JSON (Over TLS 1.3)
═════════════════╪═════════════════════════════════════════════════════════ [ Trust Boundary 1 ]
                 ▼
    ┌─────────────────────────┐
    │ Trust Boundary Gateway  │ ──> CORS / Rate Limiter / OTP Verification
    └─────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │  Spring Security Filter │ ──> Role-Based Access Control (RBAC)
    │     & Auth Enclave      │     [ADMIN, OWNER, VIEWER, PENDING_APPROVAL, REVOKED]
    └─────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │ Business Logic Services │ ──> Document Controller / Storage Engine
    │  & Verification Engine  │     SHA-256 Checksum Validator
    └─────────────────────────┘
                 │
═════════════════╪═════════════════════════════════════════════════════════ [ Trust Boundary 2 ]
                 │ Encrypted Connection (TLS / Pool)
                 ▼
    ┌─────────────────────────┐
    │ PostgreSQL Secure Store │ ──> Users, Credentials (BCrypt), Documents,
    │     (AWS Neon Enclave)  │     Permissions, Immutable Audit Logs
    └─────────────────────────┘
```

---

## 3. Asset Classification & Sensitivity Levels

| Asset Identifier | Asset Description | Confidentiality Tier | Integrity Requirement | Availability Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **A-01: Encrypted Documents** | Proprietary corporate records, financial filings, and legal agreements. | **CRITICAL** | **CRITICAL** (SHA-256) | High |
| **A-02: Identity Credentials** | User passwords, password hashes, and OTP temporary tokens. | **CRITICAL** | **CRITICAL** (BCrypt) | High |
| **A-03: Access Permissions** | Fine-grained document authorization matrix and expiration bounds. | High | **CRITICAL** | High |
| **A-04: System Audit Logs** | Tamper-evident ledger of all user actions and enclave operations. | High | **CRITICAL** (Append-only) | High |
| **A-05: Worker Identifiers** | Distinct cryptographic worker IDs (`TV-USR-xxxx`). | Medium | High | High |

---

## 4. STRIDE Threat Modeling Analysis

### 4.1. Spoofing (Identity Impersonation)
* **Threat Description (T-01):** An adversary attempts to forge session credentials or hijack another worker's identity to access protected documents.
* **Attack Vectors:** Credential stuffing, brute-force OTP guessing, spoofed administrative requests.
* **Technical Mitigations in TrustVault:**
  1. **BCrypt Password Hashing:** All passwords are salted and hashed with adaptive BCrypt iterations in [`SecurityConfig.java`](file:///D:/TrustVault/trustvault-backend/src/main/java/com/trustvault/SecurityConfig.java).
  2. **Multi-Factor OTP Enforcement:** Non-admin logins require verified 6-digit OTP delivery with a strict 30-second cooldown timer enforced in [`OtpController.java`](file:///D:/TrustVault/trustvault-backend/src/main/java/com/trustvault/OtpController.java) and [`Login.jsx`](file:///D:/TrustVault/frontend/src/pages/Login.jsx).
  3. **Approval Gating:** Newly registered users receive `PENDING_APPROVAL` status and are physically blocked from document repositories until explicitly verified by an Administrator.

---

### 4.2. Tampering (Document & Ledger Integrity)
* **Threat Description (T-02):** An unauthorized party alters confidential files, modifies database records, or tampers with document history.
* **Attack Vectors:** In-transit packet modification, database direct injection, storage file alteration.
* **Technical Mitigations in TrustVault:**
  1. **Cryptographic SHA-256 Checksums:** During upload, documents are hashed using SHA-256; hashes are recorded in the database and verified before viewing or downloading.
  2. **Tamper-Evident Watermarked Previews:** The in-browser document viewer embeds dynamic, cryptographic watermarks containing the viewer's email, Worker ID, IP, and UTC timestamp.
  3. **SQL Injection Shielding:** Strict parameterized queries via Spring Data JPA and Hibernate prevent query manipulation.

---

### 4.3. Repudiation (Denial of Operational Actions)
* **Threat Description (T-03):** A rogue user uploads malicious files, revokes legitimate access, or downloads sensitive contracts, and subsequently denies having performed the action.
* **Attack Vectors:** Unlogged operations, ambiguous user attribution, shared account misuse.
* **Technical Mitigations in TrustVault:**
  1. **Immutable Audit Ledger:** Every login, document upload, permission grant, view, download, deletion, and restoration is recorded in `app_audit_logs`.
  2. **Worker ID Tagging:** All operations log the actor's distinct Worker Code (`TV-USR-xxxx`), preventing ambiguity even if multiple users share a legal first name.
  3. **Digital Timestamping:** Each audit record captures an atomic UTC instant (`Instant.now()`) with classification severity (`INFO`, `WARNING`, `DANGER`, `SUCCESS`).

---

### 4.4. Information Disclosure (Unauthorized Data Access)
* **Threat Description (T-04):** A user belonging to the `VIEWER` tier gains unauthorized visibility into files owned by other organizations, or accesses deleted documents.
* **Attack Vectors:** URL parameter tampering (`IDOR` on `/api/documents/{id}/download`), directory traversal, unencrypted transport streams.
* **Technical Mitigations in TrustVault:**
  1. **Server-Side Authorization Enclave:** Endpoint [`DocumentController.java`](file:///D:/TrustVault/trustvault-backend/src/main/java/com/trustvault/DocumentController.java) cryptographically inspects requester email and active permission grants before streaming bytes.
  2. **Ephemeral Document Previews:** Files viewed in the browser are streamed as transient memory blobs with auto-revoking object URLs (`URL.revokeObjectURL(url)`).
  3. **Soft-Delete Enclave Isolation:** Deleted documents are moved out of active catalog queries into an administrative quarantine enclave accessible only by the original owner and platform administrators.

---

### 4.5. Denial of Service (Availability Degradation)
* **Threat Description (T-05):** An attacker floods the OTP generation endpoint or exhausts server resources through repeated massive file downloads.
* **Attack Vectors:** OTP email flooding, connection pool exhaustion, file streaming memory exhaustion.
* **Technical Mitigations in TrustVault:**
  1. **Stateful OTP Rate Limiting:** Enforces a mandatory 30-second cooldown per target address before fresh codes can be requested.
  2. **Vite Production Bundling:** Static assets are chunked, minified, and cached, reducing CPU overhead to < 10% during peak navigation.
  3. **Connection Pooling & Non-Blocking Streams:** HikariCP connection pooling and buffered binary streaming prevent memory leaks.

---

### 4.6. Elevation of Privilege (Clearance Escalation)
* **Threat Description (T-06):** A Viewer attempts to perform Owner actions (e.g. upload files or grant clearances) or an Owner attempts to execute Administrator commands.
* **Attack Vectors:** Role manipulation in client payloads, modified request body parameters, bypassed UI checks.
* **Technical Mitigations in TrustVault:**
  1. **Server-Side Role Authority:** Spring Security checks user roles from the authenticated database principal, never trusting client-side local storage or claims.
  2. **Instant Account Revocation:** When an administrator revokes an account, the user's status is set to `REVOKED`. The system blocks authentication immediately and revokes active sessions across all endpoints.

---

## 5. DREAD Risk Assessment & Scoring Matrix

| Threat ID | Threat Scenario | Damage (1-10) | Reproducibility (1-10) | Exploitability (1-10) | Affected Users (1-10) | Discoverability (1-10) | DREAD Score | Risk Level |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **T-01** | Account Takeover via Brute-Force Password | 8 | 3 | 3 | 4 | 4 | **4.4** | **Medium** (Mitigated by OTP) |
| **T-02** | File Tampering in Transit | 9 | 2 | 2 | 3 | 3 | **3.8** | **Low** (Mitigated by TLS & SHA-256) |
| **T-03** | Unauthorized Download via IDOR | 8 | 4 | 3 | 4 | 5 | **4.8** | **Medium** (Mitigated by Enclave Guard) |
| **T-04** | Role Escalation to Administrator | 10 | 2 | 2 | 10 | 3 | **5.4** | **Medium** (Mitigated by RBAC & Approval Gate) |
| **T-05** | Unauthorized Screen Capture of Protected Document | 6 | 9 | 8 | 2 | 8 | **6.6** | **High** (Mitigated by Cryptographic Watermarking) |
| **T-06** | Compromised User Continued Access | 8 | 4 | 3 | 5 | 4 | **4.8** | **Medium** (Mitigated by Instant Revocation Protocol) |

---

## 6. Zero-Trust Security Controls Implementation Cross-Reference

| Security Control | Code Implementation | Verification Mechanism |
| :--- | :--- | :--- |
| **Identity Verification & Clearance Gate** | [`AuthController.java`](file:///D:/TrustVault/trustvault-backend/src/main/java/com/trustvault/AuthController.java) | New signups default to `PENDING_APPROVAL` status; access denied until authorized. |
| **Instant Account Revocation Protocol** | [`OtpController.java`](file:///D:/TrustVault/trustvault-backend/src/main/java/com/trustvault/OtpController.java) | `REVOKED` accounts are blocked at login with custom security alert dialogs. |
| **Granular Document Clearance** | [`DocumentController.java`](file:///D:/TrustVault/trustvault-backend/src/main/java/com/trustvault/DocumentController.java) | Checks viewer email, active permission entries, and validity expiration dates. |
| **Cryptographic Integrity Check** | [`Document.java`](file:///D:/TrustVault/trustvault-backend/src/main/java/com/trustvault/Document.java) | SHA-256 hash generated on ingestion; verified before dispatch. |
| **Tamper-Evident Reader** | [`documentContent.ts`](file:///D:/TrustVault/frontend/src/utils/documentContent.ts) | Embeds user identity, Worker ID, timestamp, and security classification on views. |
| **Immutable Security Audit Trail** | [`AuditLogRepository.java`](file:///D:/TrustVault/trustvault-backend/src/main/java/com/trustvault/repository/AuditLogRepository.java) | Appends structured records with severity levels on every enclave event. |

---

## 7. Incident Response & Threat Mitigation Recommendations
1. **Compromised Account Protocol:** In the Admin Console, immediately click **Revoke User**. This terminates access tokens, flags the account as `REVOKED`, and logs a `DANGER` alert in the audit ledger.
2. **Accidental Deletion Recovery:** If a file is mistakenly deleted, navigate to **Deleted Documents** in the Owner or Admin dashboard and click **Restore** to bring it back to active circulation.
3. **Secret Rotation:** Rotate `DB_PASSWORD` and administrative credentials on a scheduled 90-day cadence.

---

## 8. Multi-Cloud Hybrid Deployment Threat Analysis (Vercel + Render + Neon AWS)

TrustVault uses a distributed multi-cloud topology:
- **Frontend SPA Layer:** Vercel Global Edge Network (`https://frontend-roan-three-7fqlz5ax9a.vercel.app`)
- **Backend Cryptographic API Layer:** Render Web Service (`https://trustvault-blgr.onrender.com`)
- **Persistence & Audit Layer:** Neon Serverless PostgreSQL (`ep-gentle-sun-b5gv4iid-pooler.c-7.us-east-2.aws.neon.tech`)

```
 [ Client Browser ]
        │
        ├─── HTTPS (Static Assets) ───> [ Vercel Global Edge CDN ]
        │                                      │
        │                                      ▼ (API Edge Proxy Rewrite)
        └─── HTTPS (REST /api/**) ───────────> [ Render Cloud Web Service ]
                                                (Spring Boot 3 / Port 10000 / $PORT)
                                                       │
                                                       ▼ TLS 1.3 (sslmode=require)
                                                [ Neon Serverless PostgreSQL ]
                                                (AWS us-east-2 / Pooler / Audit Ledger)
```

### 8.1. Threat T-07: Static Edge Fallback & 405 Method Not Allowed
* **Threat Description:** When frontend code sends mutation requests (`POST /api/auth/send-otp`, `POST /api/documents/upload`) without a configured base URL, the browser sends requests directly to the Vercel static server. Because static edge servers do not accept `POST` requests for static HTML assets (`index.html`), Vercel immediately responds with `405 Method Not Allowed`, blinding client authentication.
* **Mitigations in TrustVault:**
  1. **Dual Edge Proxy Rewrite:** Configured `frontend/vercel.json` with an edge rewrite rule (`/api/:path* -> https://trustvault-blgr.onrender.com/api/:path*`). Calls hitting Vercel are reverse-proxied without 405 errors.
  2. **Safe Client Base URL Resolution:** `api.ts` checks `VITE_API_BASE_URL`, `BACKEND_API_BASE_URL`, and `VITE_BACKEND_URL`, sanitizing trailing slashes with `.replace(/\/+$/, '')` to prevent double slashes (`//api/...`).

### 8.2. Threat T-08: Client-Side Environment Variable Stripping & Exposure
* **Threat Description:** Vite strips any environment variable that does not begin with `VITE_` during production compilation. If an operator configures `BACKEND_API_BASE_URL` on Vercel, the browser receives an empty string. Conversely, sensitive backend variables (database passwords, mail credentials) risk being leaked if bundled.
* **Mitigations in TrustVault:**
  1. **Vite Prefix Whitelisting:** `vite.config.js` configures `envPrefix: ['VITE_', 'BACKEND_']` strictly for public backend URLs.
  2. **Repository Secret Exclusion:** `.env` and `.env.*` are strictly excluded from git tracking via `.gitignore`. All database passwords and SMTP keys reside exclusively in Render backend environment configurations.

### 8.3. Threat T-09: Cross-Origin Resource Sharing (CORS) & Header Injection
* **Threat Description:** Cross-origin communication between the Vercel frontend domain and Render backend domain is blocked by modern browser Same-Origin Policy (SOP) unless explicitly permitted.
* **Mitigations in TrustVault:**
  1. **Spring Security CORS Filter:** `SecurityConfig.java` enforces origin pattern matching, allows `GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH`, exposes response headers, enables credentials, and caches pre-flight OPTIONS queries for 3,600 seconds (`maxAge(3600L)`).

### 8.4. Threat T-10: Render Dynamic Port Allocation & Cold-Start Latency
* **Threat Description:** Render Cloud Web Services dynamically assign container ports via the `$PORT` environment variable (e.g. 10000). Spring Boot defaulting to port 8080 causes container healthcheck failure. Additionally, free-tier Render services spin down after inactivity, creating cold-start latency.
* **Mitigations in TrustVault:**
  1. **Dynamic Port Binding in Dockerfile:** Production entrypoint executes `java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar`.
  2. **Dedicated Health Endpoint:** Lightweight `/api/health` and `/` endpoints return JSON telemetry without hitting database write locks, enabling fast container boot and keep-alive pinging.

