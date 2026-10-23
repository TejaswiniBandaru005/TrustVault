/**
 * TrustVault Secure Document Content Generator & File Viewer Utility
 * Generates authentic, readable document content, downloadable files,
 * and in-browser reader tabs for verified personnel.
 */

export function generateDocumentText(doc) {
  const name = doc?.name || "Confidential_Document.pdf";
  const category = doc?.category || "Enterprise";
  const owner = doc?.owner || "TrustVault Authorized Owner";
  const updated = doc?.updated || "October 2026";
  const size = doc?.size || "1.4 MB";
  const id = doc?.id || "TV-DOC-" + Math.floor(1000 + Math.random() * 9000);

  let specificSections = "";

  if (category.toLowerCase().includes("finance")) {
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

Implementation Road:
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
TRUSTVAULT SECURE DOCUMENT ENCLAVE
OFFICIAL RESTRICTED RECORD - ZERO-TRUST ACCESS CONTROL
================================================================================
DOCUMENT TITLE : ${name}
CATEGORY       : ${category}
DOCUMENT ID    : ${id}
OWNER / ISSUER : ${owner}
LAST REVISED   : ${updated}
ARCHIVE SIZE   : ${size}
SECURITY LEVEL : CLASSIFIED LEVEL-2 RESTRICTED ACCESS
INTEGRITY HASH : 8f72a4e9102c91834281f9a2b4e7c3d1928374a5b6c7d8e9f0a1b2c3d4e5f6a7

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
 * Downloads a physical file to user's local disk
 */
export function downloadRealDocument(doc) {
  const content = generateDocumentText(doc);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const baseName = doc?.name
    ? doc.name.replace(/\.[^/.]+$/, "")
    : "TrustVault_Document";
  const filename = `${baseName}.txt`;

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
export function openDocumentInNewTab(doc) {
  const text = generateDocumentText(doc);
  const title = doc?.name || "TrustVault Document";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} - TrustVault Reader</title>
  <style>
    body {
      background: #0f172a;
      color: #e2e8f0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
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
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.88rem;
    }
    button:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>${title}</h1>
        <small style="color: #94a3b8;">TrustVault Secure Reader Enclave</small>
      </div>
      <span class="badge">CONFIDENTIAL</span>
    </div>
    <pre>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
    <div class="actions">
      <button onclick="window.print()">Print Document</button>
      <button onclick="window.close()">Close Window</button>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
