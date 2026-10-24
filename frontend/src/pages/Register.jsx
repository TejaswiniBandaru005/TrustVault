import { useState } from "react";
import {
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  Eye,
  Files,
  UserRoundCog,
  Check,
  CheckCircle2,
  Clock3,
  UserX,
  ShieldAlert,
  AlertTriangle,
  User,
  Mail,
  KeyRound,
  Info,
} from "lucide-react";
import { apiRequest } from "../api";
import TrustVaultLogo from "../components/TrustVaultLogo";

export const ROLE_DETAILS = {
  viewer: {
    roleName: "Viewer",
    badge: "Consumer Clearance",
    badgeBg: "rgba(37, 99, 235, 0.12)",
    badgeColor: "#2563eb",
    icon: Eye,
    tagline: "Explore, preview, and request access to protected enterprise documents.",
    summary:
      "As a Viewer, your workspace is dedicated to secure document consumption. You can browse authorized files, request view or download clearance from document owners, and view protected materials with dynamic cryptographic watermarks.",
    responsibilities: [
      {
        title: "Protected Document Exploration",
        description:
          "Browse confidential documents across Business, Finance, Legal, and Technical categories permitted for your clearance tier.",
      },
      {
        title: "Access Clearance Requests",
        description:
          "Submit formal clearance requests to Document Owners when restricted or sensitive documents require your inspection.",
      },
      {
        title: "Dynamic Watermarked Previews",
        description:
          "Review files in an isolated in-browser reader tagged with tamper-evident cryptographic watermarks displaying your identity and timestamp.",
      },
      {
        title: "Controlled Download Privileges",
        description:
          "Download original source files strictly after explicit authorization has been granted by the Document Custodian.",
      },
    ],
    guidelines: [
      "Access sessions are logged and cryptographically audited by the zero-trust engine.",
      "Never attempt to distribute or extract watermarked preview materials.",
      "New viewer registrations require verification by an Administrator or Owner before full clearance is granted.",
    ],
  },
  owner: {
    roleName: "Document Owner",
    badge: "Custodian Clearance",
    badgeBg: "rgba(16, 185, 129, 0.12)",
    badgeColor: "#059669",
    icon: Files,
    tagline: "Upload, encrypt, delegate permissions, and supervise file lifecycles.",
    summary:
      "As a Document Owner, you hold primary custody over your uploaded files. You determine who can access your assets, define view-only vs download rights, approve or reject viewer clearance requests, and audit document interactions.",
    responsibilities: [
      {
        title: "Cryptographic Document Ingestion",
        description:
          "Upload organizational files with automated SHA-256 hash generation, integrity verification, and encryption at rest.",
      },
      {
        title: "Granular Permission Delegation",
        description:
          "Grant custom access levels ('View only' or 'View + Download') with automatic expiration timestamps to verified viewers.",
      },
      {
        title: "Clearance Request Evaluation",
        description:
          "Review incoming viewer access requests, inspect requester credentials, and approve or reject submissions in real-time.",
      },
      {
        title: "Instant Revocation & Audit Logs",
        description:
          "Immediately revoke active document permissions at any time and inspect complete history logs tracking view and download activity.",
      },
      {
        title: "Safe Deletion & Recovery Enclave",
        description:
          "Move files to the Deleted Documents enclave with full audit tracking, allowing restoration at any time.",
      },
    ],
    guidelines: [
      "Always set appropriate expiration dates on sensitive document authorizations.",
      "Periodically review active permissions and revoke access for completed projects.",
      "Verify requester identities before granting download permissions on confidential files.",
    ],
  },
  admin: {
    roleName: "Administrator",
    badge: "Master Security Clearance",
    badgeBg: "rgba(220, 38, 38, 0.12)",
    badgeColor: "#dc2626",
    icon: UserRoundCog,
    tagline: "System-wide governance, user clearance verification, and security enclave oversight.",
    summary:
      "As a TrustVault Administrator, you command platform-wide security governance. You verify new user identities, approve or revoke accounts, supervise the global document enclave, and inspect immutable audit logs.",
    responsibilities: [
      {
        title: "User Verification & Identity Clearance",
        description:
          "Review pending registrations from Viewers and Owners, validating legal identities and assigning official worker IDs before unlocking vault access.",
      },
      {
        title: "Security Enforcement & Account Revocation",
        description:
          "Instantly revoke compromised accounts, terminate active user sessions, and prevent unauthorized re-registration.",
      },
      {
        title: "Organization-Wide Document Oversight",
        description:
          "Supervise documents across all owners, inspect file lifecycles, and restore deleted documents to active circulation when required.",
      },
      {
        title: "Immutable System Audit Log Surveillance",
        description:
          "Monitor platform-wide tamper-evident audit trails tracking every login attempt, document upload, permission grant, and deletion.",
      },
      {
        title: "Zero-Trust Policy Enforcement",
        description:
          "Enforce two-factor authentication, cryptographic hash validation, and security compliance standards across the enterprise.",
      },
    ],
    guidelines: [
      "Process pending user verification requests promptly to enable organizational workflows.",
      "Safeguard administrative credentials; master actions are permanently recorded in audit logs.",
      "Regularly review system activity logs for anomalies, repeated failed logins, or unauthorized permission attempts.",
    ],
  },
};

function Register({ role = "viewer", onNavigate, onPreview }) {
  const [selectedRole, setSelectedRole] = useState(
    role === "owner" ? "owner" : role === "admin" ? "admin" : "viewer"
  );
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View state: "form" | "pending" | "revoked"
  const [viewState, setViewState] = useState("form");
  const [registeredData, setRegisteredData] = useState(null);
  const [revokedEmail, setRevokedEmail] = useState("");

  const submitRegistration = async (event) => {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please verify both entries.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role: selectedRole.toUpperCase(),
        }),
      });

      // Requirement 1: Registration successful -> Page moves to left side showing registered details
      setRegisteredData({
        fullName: fullName.trim(),
        email: email.trim(),
        role: selectedRole,
        userCode: data?.userCode || "TV-USR-NEW",
        status: data?.status || "PENDING_APPROVAL",
      });
      setViewState("pending");
    } catch (error) {
      const errText = error.message || "";
      // Requirement 2: Existing revoked account -> moves to left side with revoked notice
      if (errText.toLowerCase().includes("revoked") || errText.toLowerCase().includes("no longer")) {
        setRevokedEmail(email.trim());
        setViewState("revoked");
      } else {
        setMessage(errText || "Cannot connect to the TrustVault backend.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // View 1: Registered as New User (Moves to Left Side - Req 1 & 4)
  // -------------------------------------------------------------
  if (viewState === "pending" && registeredData) {
    return (
      <main className="auth-page layout-left">
        <section className="auth-card registered-details-card">
          <button type="button" className="back-link" onClick={() => onNavigate("home")}>
            ← Back to TrustVault
          </button>

          <div className="registered-header-badge">
            <Clock3 size={18} />
            <span>Registered as New User</span>
          </div>

          <h1>Registration Complete</h1>
          <p className="auth-description">
            Your credentials have been securely encrypted and stored. Please wait for an Administrator or Document Owner to verify your identity and grant access.
          </p>

          <div className="account-details-box">
            <div className="account-details-title">
              <ShieldCheck size={16} />
              <span>Registered Account Credentials</span>
            </div>

            <div className="account-details-grid">
              <div className="account-detail-item">
                <label>Full Name</label>
                <strong>{registeredData.fullName}</strong>
              </div>

              <div className="account-detail-item">
                <label>Registered Email</label>
                <strong>{registeredData.email}</strong>
              </div>

              <div className="account-detail-item">
                <label>Unique Worker ID</label>
                <span className="worker-id-pill">{registeredData.userCode}</span>
              </div>

              <div className="account-detail-item">
                <label>Requested Role</label>
                <strong>{registeredData.role === "owner" ? "Document Owner" : registeredData.role === "admin" ? "Administrator" : "Viewer"}</strong>
              </div>

              <div className="account-detail-item full-width">
                <label>Verification Status</label>
                <span className="status-badge-pending">
                  <span className="pulsing-amber-dot" />
                  Awaiting Administrator / Owner Approval
                </span>
              </div>
            </div>
          </div>

          <div className="unverified-alert-box">
            <ShieldAlert size={22} className="unverified-alert-icon" />
            <div>
              <strong>Your account is not verified and access is not granted.</strong>
              <p>
                Confidential documents, encrypted storage, and shared vaults remain restricted until an administrator verifies your unique ID and grants approval.
              </p>
            </div>
          </div>

          <div className="unverified-actions-group">
            {/* Requirement 4: Preview button displayed. ONLY when clicked does it enter preview mode */}
            <button
              type="button"
              className="button button-primary preview-button"
              onClick={() => onPreview(registeredData.role.toUpperCase(), registeredData.email)}
            >
              <Eye size={18} /> Explore in Preview Mode <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="button button-secondary"
              onClick={() => onNavigate("login", { email: registeredData.email })}
            >
              Sign In to Your Account
            </button>
          </div>

          <p className="preview-guidance-note">
            Preview mode provides an empty, isolated workspace preview so you can explore the interface safely while your account verification is in progress.
          </p>
        </section>
      </main>
    );
  }

  // -------------------------------------------------------------
  // View 2: Existing User Revoked (Moves to Left Side - Req 2)
  // -------------------------------------------------------------
  if (viewState === "revoked") {
    return (
      <main className="auth-page layout-left">
        <section className="auth-card revoked-details-card">
          <button type="button" className="back-link" onClick={() => onNavigate("home")}>
            ← Back to TrustVault
          </button>

          <div className="revoked-header-icon">
            <UserX size={38} />
          </div>

          <div className="revoked-badge">
            <ShieldAlert size={16} />
            <span>Account Revoked</span>
          </div>

          <h1 style={{ color: "#ef4444" }}>You no longer have access to sign up</h1>
          <p className="auth-description">
            The account associated with <strong>{revokedEmail || email}</strong> has been revoked by an Administrator. You are no longer authorized to sign up, request access, or use TrustVault.
          </p>

          <div className="revoked-alert-box">
            <LockKeyhole size={20} />
            <div>
              <strong>Security Protocol Enforced</strong>
              <p>
                All account privileges and session authorisations have been permanently revoked by platform security.
              </p>
            </div>
          </div>

          <div className="revoked-actions-group">
            <button
              type="button"
              className="button button-primary"
              style={{ background: "#374151", borderColor: "#4b5563" }}
              onClick={() => {
                setViewState("form");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setMessage("");
              }}
            >
              Try with another email
            </button>

            <button
              type="button"
              className="button button-secondary"
              onClick={() => onNavigate("home")}
            >
              Return to Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  // -------------------------------------------------------------
  // View 3: Normal Sign Up Form (Split 2-Container Layout)
  // Left Container: Sign In / Create Account Card
  // Right Container: User Instructions & Dynamic Role Responsibilities
  // -------------------------------------------------------------
  const roleInfo = ROLE_DETAILS[selectedRole] || ROLE_DETAILS.viewer;
  const RoleIcon = roleInfo.icon;

  return (
    <main className="auth-page layout-split">
      <div className="register-split-wrap">
        {/* Left Container: Sign In / Create Account Card */}
        <div className="register-left-col">
          <section className="auth-card register-auth-card">
            <button type="button" className="back-link" onClick={() => onNavigate("home")}>
              ← Back to TrustVault
            </button>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
              <TrustVaultLogo size={44} showText={false} animated={true} />
            </div>

            <div className="auth-tab-row">
              <button type="button" className="auth-tab-btn active">
                Create Account
              </button>
              <button
                type="button"
                className="auth-tab-btn"
                onClick={() => onNavigate("login", { role: selectedRole })}
              >
                Sign In
              </button>
            </div>

            <h1>Create your account</h1>
            <p className="auth-description">
              Register to join the TrustVault secure document workspace.
            </p>

            {/* Selected Role Display & Inline Role Switcher (Matching Sign-in page) */}
            <div className="selected-role-note">
              <div className="selected-role-note-info">
                <span>Selected role:</span>
                <strong>
                  {selectedRole === "owner"
                    ? "Document Owner"
                    : selectedRole === "admin"
                    ? "Administrator"
                    : "Viewer"}
                </strong>
              </div>
              <button
                type="button"
                className="role-change-btn"
                onClick={() => setShowRolePicker(!showRolePicker)}
              >
                {showRolePicker ? "Cancel" : "Change"}
              </button>
            </div>

            {showRolePicker && (
              <div className="role-inline-picker">
                <p className="role-inline-picker-title">Switch role for registration:</p>
                <div className="role-inline-options">
                  <button
                    type="button"
                    className={`role-option-item ${selectedRole === "viewer" ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedRole("viewer");
                      setShowRolePicker(false);
                    }}
                  >
                    <div className="role-option-icon"><Eye size={17} /></div>
                    <div className="role-option-info">
                      <strong>Viewer</strong>
                      <span>Browse and request document access</span>
                    </div>
                    {selectedRole === "viewer" && <Check size={16} className="role-checked" />}
                  </button>

                  <button
                    type="button"
                    className={`role-option-item ${selectedRole === "owner" ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedRole("owner");
                      setShowRolePicker(false);
                    }}
                  >
                    <div className="role-option-icon"><Files size={17} /></div>
                    <div className="role-option-info">
                      <strong>Document Owner</strong>
                      <span>Upload, share, and protect files</span>
                    </div>
                    {selectedRole === "owner" && <Check size={16} className="role-checked" />}
                  </button>

                  <button
                    type="button"
                    className={`role-option-item ${selectedRole === "admin" ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedRole("admin");
                      setShowRolePicker(false);
                    }}
                  >
                    <div className="role-option-icon"><UserRoundCog size={17} /></div>
                    <div className="role-option-info">
                      <strong>Administrator</strong>
                      <span>Review requests and manage security</span>
                    </div>
                    {selectedRole === "admin" && <Check size={16} className="role-checked" />}
                  </button>
                </div>
              </div>
            )}

            <form className="auth-form" onSubmit={submitRegistration}>
              <label>
                Full name
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full legal or employee name"
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password (min 8 characters)"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>

              <label>
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>

              <div className="form-notice">
                {selectedRole === "owner"
                  ? "Your Document Owner account will require Administrator approval before file management and custody operations are unlocked."
                  : selectedRole === "admin"
                  ? "Your Administrator account will require master security verification before platform governance tools are unlocked."
                  : "Your Viewer account will require Administrator approval before document access requests can be authorized."}
              </div>

              <button
                className="button button-primary auth-submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Encrypting and registering..." : "Register Account"}
                <ArrowRight size={18} />
              </button>
            </form>

            {message && (
              <div className="register-error-banner" role="alert">
                <AlertTriangle size={18} />
                <div>
                  <strong>{message}</strong>
                  {message.toLowerCase().includes("already exists") && (
                    <div style={{ marginTop: "6px" }}>
                      <button
                        type="button"
                        className="button button-secondary"
                        style={{ padding: "6px 12px", fontSize: "12px", marginTop: "4px" }}
                        onClick={() => onNavigate("login", { email })}
                      >
                        Proceed to Sign In &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="auth-switch">
              Already registered?{" "}
              <button type="button" onClick={() => onNavigate("login", { role: selectedRole })}>
                Sign in
              </button>
            </div>

            <div className="auth-security-note">
              <LockKeyhole size={16} />
              <span>Every worker and user is assigned a verified unique cryptographic ID</span>
            </div>
          </section>
        </div>

        {/* Right Container: Instructions & Dynamic Role Responsibilities */}
        <div className="register-right-col">
          <aside className="register-instructions-panel">
            <div className="instruction-header">
              <div
                className="instruction-badge"
                style={{ background: roleInfo.badgeBg, color: roleInfo.badgeColor }}
              >
                <RoleIcon size={15} />
                <span>{roleInfo.badge}</span>
              </div>
              <h2>{roleInfo.roleName} Workspace & Responsibilities</h2>
              <p className="instruction-tagline">{roleInfo.tagline}</p>
            </div>

            <div className="instruction-overview-box">
              <p>{roleInfo.summary}</p>
            </div>

            <div className="instruction-section">
              <h3 className="instruction-section-title">
                <ShieldCheck size={17} style={{ color: roleInfo.badgeColor }} />
                Core Responsibilities
              </h3>
              <div className="instruction-items-list">
                {roleInfo.responsibilities.map((item, idx) => (
                  <div className="instruction-item" key={idx}>
                    <div
                      className="instruction-item-num"
                      style={{ color: roleInfo.badgeColor, borderColor: roleInfo.badgeColor }}
                    >
                      {idx + 1}
                    </div>
                    <div className="instruction-item-text">
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="instruction-guidelines-box">
              <h4>
                <Info size={15} />
                Security & Compliance Guidelines
              </h4>
              <ul>
                {roleInfo.guidelines.map((rule, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={15} className="guideline-check-icon" style={{ color: roleInfo.badgeColor }} />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="instruction-footer-note">
              <LockKeyhole size={14} />
              <span>
                Zero-Trust Architecture: Role permissions are cryptographically verified per request by the TrustVault enclave.
              </span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Register;
