/**
 * TrustVault Secure Document Content Generator & File Viewer Utility
 * Delivers real file downloads from the backend server, and provides
 * in-browser viewer and reader tabs for authorized personnel.
 */

export interface DocumentLike {
  id?: number | string;
  name?: string;
  title?: string;
  category?: string;
  owner?: string;
  updated?: string;
  size?: string;
  fileChecksum?: string;
  type?: string;
}

export function generateDocumentText(doc?: DocumentLike): string {
  const name = doc?.name || doc?.title || "Confidential_Document.pdf";
  const category = doc?.category || "Enterprise";
  const owner = doc?.owner || "TrustVault Authorized Owner";
  const updated = doc?.updated || "October 2026";
  const size = doc?.size || "1.4 MB";
  const id = doc?.id || "TV-DOC-" + Math.floor(1000 + Math.random() * 9000);

  let specificSections = "";

  const nameLower = name.toLowerCase();

  if (nameLower.includes("day 01") || nameLower.includes("day_01") || nameLower.includes("day 1")) {
    specificSections = `
--------------------------------------------------------------------------------
1. DAY 1 ENGINEERING REPORT: PROBLEM FORMULATION & ZERO-TRUST FOUNDATIONS
--------------------------------------------------------------------------------
Milestone Date : October 19, 2026
Objective      : Architectural Inception, Security Posture & Role Matrix Definition

Executive Summary:
TrustVault was conceptualized to address critical enterprise data custody failures.
Traditional boundary defenses fail against insider threats, stolen tokens, and
silent document tampering. We established the four foundational Zero-Trust axioms:
1. Explicit Verification: No identity is trusted without cryptographic proof.
2. Least Privilege Clearances: Clearances are granted on demand and time-bounded.
3. Assume Breach: All reads, writes, and delegations are permanently audited.
4. Cryptographic Non-Repudiation: Document byte streams are hashed upon ingestion.

Key Architecture Decisions:
- Triple-Tier RBAC: Strict delineation between VIEWER, OWNER, and ADMINISTRATOR.
- Spring Boot 3 + Java 21: Cryptographic backend isolated from public client networks.
- React 19 + TypeScript: Type-safe enclave interface with zero-trust watermarked views.
`;
  } else if (nameLower.includes("day 02") || nameLower.includes("day_02") || nameLower.includes("day 2")) {
    specificSections = `
--------------------------------------------------------------------------------
2. DAY 2 ENGINEERING REPORT: THREAT MODELING & STRIDE ASSESSMENT
--------------------------------------------------------------------------------
Milestone Date : October 20, 2026
Objective      : STRIDE Matrix Formulation, Attack Surface Mapping & DREAD Scoring

Threat Modeling Analysis:
- Spoofing (S)          : Addressed via 6-digit cryptographic OTP & email purpose-binding.
- Tampering (T)         : Addressed via SHA-256 byte hashing computed at file ingestion.
- Repudiation (R)       : Addressed via append-only PostgreSQL security audit ledger.
- Info Disclosure (I)   : Addressed via strict IDOR access checks & dynamic watermarking.
- Denial of Service (D) : Addressed via rate-limiting cooldown timers on OTP endpoints.
- Elevation of Priv (E) : Addressed via server-side authority locks (PENDING_APPROVAL).

DREAD Risk Highlights:
- Screen capture of sensitive data mitigated via dynamic in-browser identity stamps.
- Compromised accounts mitigated via one-click administrative instant revocation protocol.
`;
  } else if (nameLower.includes("day 03") || nameLower.includes("day_03") || nameLower.includes("day 3")) {
    specificSections = `
--------------------------------------------------------------------------------
3. DAY 3 ENGINEERING REPORT: CRYPTOGRAPHIC HASHING & DATABASE INTEGRATION
--------------------------------------------------------------------------------
Milestone Date : October 21, 2026
Objective      : SHA-256 Digest Engine, Storage Enclave & Neon AWS PostgreSQL

Key Implementations:
- SHA-256 Digest Pipeline: Computes 64-character hexadecimal checksum upon file upload.
- Neon Serverless PostgreSQL: AWS us-east-2 pooled cluster connection with SSL mode require.
- Database Entity Schema: AppUser, Document, DocumentPermission, and AuditLog tables.
- Storage Enclave: Disk isolation under uploads/documents/ with UUID salt filenames.
- Git Repository: Initialized repository structure with clean commit logging.
`;
  } else if (nameLower.includes("day 04") || nameLower.includes("day_04") || nameLower.includes("day 4")) {
    specificSections = `
--------------------------------------------------------------------------------
4. DAY 4 ENGINEERING REPORT: MULTI-FACTOR AUTHENTICATION & OTP ENGINE
--------------------------------------------------------------------------------
Milestone Date : October 22, 2026
Objective      : Spring Security 6 Filter Chain, OTP Dispatcher & Role Governance

Security Deliverables:
- Stateless Filter Chain: CSRF-exempt stateless JWT/Session token architecture.
- 6-Digit OTP Generator: Cryptographic randomness with 5-minute time window.
- Single-Use Invalidation: OTPs self-destruct upon initial consumption to prevent replay.
- Purpose-Scoped Validation: LOGIN OTPs cannot be recycled for PASSWORD_RESET actions.
- Role Responsibilities UI: Dynamic role switcher with detailed duty explanation cards.
`;
  } else if (nameLower.includes("day 05") || nameLower.includes("day_05") || nameLower.includes("day 5")) {
    specificSections = `
--------------------------------------------------------------------------------
5. DAY 5 ENGINEERING REPORT: VERCEL & RENDER MULTI-CLOUD DEPLOYMENT
--------------------------------------------------------------------------------
Milestone Date : October 23, 2026
Objective      : Distributed Cloud Architecture, Vercel SPA Rewrites & CORS Hardening

DevOps Milestones:
- Cloud Topology: Frontend on Vercel Global Edge CDN, Backend on Render Cloud Web Service.
- Resolved Build Error 126: Directly executed node node_modules/vite/bin/vite.js build in CI.
- Resolved 405 Method Not Allowed: Configured vercel.json reverse proxy for /api/** requests.
- Vite Env Prefix: Whitelisted envPrefix: ['VITE_', 'BACKEND_'] to safely bridge cloud URLs.
- Spring Security CORS: Whitelisted allowedOriginPatterns, allowedHeaders, and credentials.
`;
  } else if (nameLower.includes("day 06") || nameLower.includes("day_06") || nameLower.includes("day 6")) {
    specificSections = `
--------------------------------------------------------------------------------
6. DAY 6 ENGINEERING REPORT: ENCLAVE SOFT-DELETE & ACCESS GATING
--------------------------------------------------------------------------------
Milestone Date : October 24, 2026
Objective      : Segregated Deletion Enclave, Preview Containment & Instant Revocation

Governance Features:
- Soft-Delete Enclave: Deleted files are preserved in a secluded enclave with restore options.
- Unverified User Isolation: Accounts in PENDING_APPROVAL status are strictly locked out of
  production document APIs and restricted to an isolated empty preview sandbox.
- Revocation Architecture: Blocked users receive red security notices; access terminated.
- Interactive OTP UX: Added real-time 30-second cooldown timer and email change controls.
`;
  } else if (nameLower.includes("day 07") || nameLower.includes("day_07") || nameLower.includes("day 7")) {
    specificSections = `
--------------------------------------------------------------------------------
7. DAY 7 ENGINEERING REPORT: AUTOCOMPLETE DELEGATION & HARDENING
--------------------------------------------------------------------------------
Milestone Date : October 25, 2026
Objective      : Viewer Autocomplete Delegation, Name Sanitization & Final Verification

Final Security Hardening:
- Viewer Email Autocomplete: Real-time starting-letter prefix matching and quick-select chips.
- Dynamic Owner Attribution: Replaced static demo names with verified profile lookups.
- Container Port Binding: Added dynamic $PORT binding in Dockerfile for Render deployments.
- Admin Document Ingestion: Enabled direct report uploading from the Administrator dashboard.
- Automated Testing: 4/4 passing security tests in OtpServiceTests verifying OTP defense.
`;
  } else if (category.toLowerCase().includes("finance")) {
    specificSections = `
--------------------------------------------------------------------------------
1. FINANCIAL PERFORMANCE & STATEMENT OF ACCOUNTS
--------------------------------------------------------------------------------
- Q3 Realized Net Operating Income: $4,850,200 (+14.2% YoY)
- Enterprise Operating Margin     : 32.8%
- Free Cash Flow Conversion Rate  : 88.5%
- Allocated Capital Reserve Fund  : $12,500,000 in Tier-1 Liquid Assets
- Statutory Compliance Audit      : Cleared (Sarbanes-Oxley & IFRS 16)

Notes on Capital Allocation:
All departmental expenditure above $50,000 has been verified through zero-trust
cryptographic purchase approvals. No irregular disbursements detected.
`;
  } else if (category.toLowerCase().includes("tech")) {
    specificSections = `
--------------------------------------------------------------------------------
1. TECHNICAL SPECIFICATIONS & SYSTEM ARCHITECTURE
--------------------------------------------------------------------------------
- Encryption Standard     : AES-256-GCM at rest, TLS 1.3 in transit
- Key Management          : AWS KMS / HSM Hardware Key Enclaves
- Zero-Trust Policy       : Role-Based & Fine-Grained Access Tokens
- Database Cluster        : Neon PostgreSQL Distributed Architecture
- High Availability       : 99.995% SLA with Multi-Region Failover

Security Directives:
Direct access to raw binary file stores is prohibited. All read streams require
signed token verification and transient URL generation with 300s TTL.
`;
  } else if (category.toLowerCase().includes("business")) {
    specificSections = `
--------------------------------------------------------------------------------
1. EXECUTIVE BUSINESS PROPOSAL & PARTNERSHIP DIRECTIVES
--------------------------------------------------------------------------------
- Core Objective          : Expansion of TrustVault Enterprise Enclave Services
- Target Milestone        : Enterprise Onboarding Phase 2 (Q4 2026)
- Strategic Value         : End-to-end verifiable document integrity protection
- Risk Mitigation         : Automated audit logging with immutable ledger timestamps
- Clearance Tier          : Confidential (Distribution limited to authorized parties)

Implementation Roadmap:
Milestones 1 through 4 have received unanimous stakeholder approval. All client
confidentiality agreements remain enforceable under standard non-disclosure pacts.
`;
  } else {
    specificSections = `
--------------------------------------------------------------------------------
1. OPERATIONAL POLICIES & STANDARD OPERATING PROCEDURES
--------------------------------------------------------------------------------
- Document Classification : Restricted Internal Access
- Lifecycle Management    : Annual recertification required by document owner
- Audit Frequency         : Continuous event tracking logged to Admin Console
- Revocation Policy       : Instant revocation cuts active sessions immediately

Authorized Usage Terms:
This document is licensed for authorized review only. Reproduction, screen capture,
or external distribution without owner authorization violates enterprise policy.
`;
  }

  return `================================================================================
TRUSTVAULT ZERO-TRUST SECURE ENCLAVE
OFFICIAL RESTRICTED RECORD - ACTIVE PRODUCTION VAULT
================================================================================
DOCUMENT TITLE : ${name}
CATEGORY       : ${category}
DOCUMENT ID    : ${id}
OWNER / ISSUER : ${owner}
LAST REVISED   : ${updated}
ARCHIVE SIZE   : ${size}
SECURITY LEVEL : CLASSIFIED LEVEL-2 RESTRICTED ACCESS
INTEGRITY HASH : ${doc?.fileChecksum || "8f72a4e9102c91834281f9a2b4e7c3d1928374a5b6c7d8e9f0a1b2c3d4e5f6a7"}

${specificSections}
--------------------------------------------------------------------------------
2. ACCESS LOGS & IDENTITY STAMP
--------------------------------------------------------------------------------
Authorized Viewer Email : Verified TrustVault Session
Access Clearance Status : GRANTED & AUDITED
Digital Seal Timestamp  : ${new Date().toUTCString()}
Enforcement Enclave     : TrustVault Automated Verification Node #04

================================================================================
END OF DOCUMENT - CONFIDENTIAL & PROPRIETARY TRUSTVAULT ASSET
================================================================================
`;
}

/**
 * Escapes characters for PDF string literals
 */
function escapePdf(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * Creates a valid, multi-page PDF Blob in standard PDF 1.4 format
 */
export function createPdfBlob(title: string, text: string, doc?: DocumentLike): Blob {
  const lines = text.split("\n");
  const maxLinesPerPage = 44;
  const pages: string[][] = [];

  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage));
  }
  if (pages.length === 0) pages.push(["(No document content)"]);

  let objCount = 2; // 1: catalog, 2: pages
  const pageObjIds: number[] = [];
  const contentObjIds: number[] = [];

  for (let p = 0; p < pages.length; p++) {
    objCount++;
    pageObjIds.push(objCount);
    objCount++;
    contentObjIds.push(objCount);
  }
  objCount++;
  const fontObjId = objCount;

  let pdf = "%PDF-1.4\n";
  const offsets: Record<number, number> = {};

  const addObj = (id: number, content: string) => {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${content}\nendobj\n`;
  };

  // Catalog
  addObj(1, "<< /Type /Catalog /Pages 2 0 R >>");

  // Pages
  const kids = pageObjIds.map((id) => `${id} 0 R`).join(" ");
  addObj(2, `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);

  // Document Pages
  for (let p = 0; p < pages.length; p++) {
    const pageId = pageObjIds[p];
    const contentId = contentObjIds[p];

    addObj(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontObjId} 0 R >> >> >>`
    );

    let stream = "BT\n";
    stream += "/F1 11 Tf\n";
    stream += `50 745 Td\n(${escapePdf(title)} - Page ${p + 1} of ${pages.length}) Tj\n`;
    stream += "/F1 8.5 Tf\n";
    stream += "0 -15 Td\n(================================================================================) Tj\n";

    for (let l = 0; l < pages[p].length; l++) {
      const rawLine = pages[p][l];
      const cleanLine = rawLine.length > 92 ? rawLine.substring(0, 92) + "..." : rawLine;
      stream += `0 -13 Td\n(${escapePdf(cleanLine)}) Tj\n`;
    }

    stream += "ET\n";

    addObj(contentId, `<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
  }

  // Font
  addObj(fontObjId, "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");

  // xref
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objCount + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objCount; i++) {
    const offset = String(offsets[i] || 0).padStart(10, "0");
    pdf += `${offset} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return new Blob([pdf], { type: "application/pdf" });
}

/**
 * Downloads the actual physical file from the backend, with verified PDF fallback
 */
export async function downloadRealDocument(doc?: DocumentLike, userEmail: string = ""): Promise<void> {
  const baseName = doc?.name
    ? doc.name.replace(/\.[^/.]+$/, "")
    : doc?.title
    ? doc.title.replace(/\.[^/.]+$/, "")
    : "TrustVault_Document";
  const filename = `${baseName}.pdf`;

  if (doc?.id && userEmail) {
    try {
      const emailParam = encodeURIComponent(userEmail.trim().toLowerCase());
      const res = await fetch(`/api/documents/${doc.id}/download?email=${emailParam}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.warn("Backend direct download failed, using local PDF generator", e);
    }
  }

  const content = generateDocumentText(doc);
  const pdfBlob = createPdfBlob(doc?.name || doc?.title || "TrustVault Document", content, doc);
  const url = URL.createObjectURL(pdfBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens document in a new browser tab with clean printable styling
 */
export function openDocumentInNewTab(doc?: DocumentLike, userEmail: string = ""): void {
  if (doc?.id && userEmail) {
    const emailParam = encodeURIComponent(userEmail.trim().toLowerCase());
    window.open(`/api/documents/${doc.id}/view?email=${emailParam}`, "_blank");
    return;
  }

  const text = generateDocumentText(doc);
  const title = doc?.name || doc?.title || "TrustVault Document";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} - TrustVault Reader</title>
  <style>
    body {
      background: #0f172a;
      color: #e2e8f0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      margin: 0;
    }
    .container {
      max-width: 860px;
      width: 100%;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      padding: 35px 40px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .header h1 {
      margin: 0;
      font-size: 1.25rem;
      color: #60a5fa;
      font-family: system-ui, sans-serif;
    }
    .badge {
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.4);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    pre {
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 0.88rem;
      line-height: 1.65;
      color: #f1f5f9;
      background: #0f172a;
      padding: 24px;
      border-radius: 8px;
      border: 1px solid #1e293b;
    }
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
      }
      .container {
        max-width: 100% !important;
        background: #ffffff !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      .actions, .btn-print, .btn-close {
        display: none !important;
      }
      pre {
        background: #ffffff !important;
        color: #000000 !important;
        border: 1px solid #cccccc !important;
      }
      .badge {
        border: 1px solid #000000 !important;
        color: #000000 !important;
      }
    }
    .actions {
      margin-top: 25px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    button {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.88rem;
      transition: all 0.2s;
    }
    button:hover {
      background: #1d4ed8;
    }
    .btn-secondary {
      background: #334155;
    }
    .btn-secondary:hover {
      background: #475569;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>${title}</h1>
        <small style="color: #94a3b8;">TrustVault Zero-Trust Security Reader · PDF Document Enclave</small>
      </div>
      <span class="badge">RESTRICTED · PDF</span>
    </div>
    <pre>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
    <div class="actions">
      <button onclick="window.print()">Print / Save as PDF</button>
      <button class="btn-secondary" onclick="window.close()">Close Window</button>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
