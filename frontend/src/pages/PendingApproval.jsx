import { Clock3, ArrowRight, LockKeyhole, Eye, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";

function PendingApproval({ pendingData, onNavigate, onPreview }) {
  const email = pendingData?.email || "";
  const role = pendingData?.role || "viewer";
  const fullName = pendingData?.fullName || email.split("@")[0] || "New User";
  const userCode = pendingData?.userCode || "TV-USR-PENDING";

  const roleTitle = {
    viewer: "Viewer",
    owner: "Document Owner",
    admin: "Administrator",
  }[role.toLowerCase()] || "Viewer";

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
          Account for <strong>{email}</strong> ({roleTitle}) has been created successfully. Please wait for an Administrator or Document Owner to verify your identity and grant access.
        </p>

        <div className="account-details-box">
          <div className="account-details-title">
            <ShieldCheck size={16} />
            <span>Registered Account Credentials</span>
          </div>

          <div className="account-details-grid">
            <div className="account-detail-item">
              <label>Full Name</label>
              <strong>{fullName}</strong>
            </div>

            <div className="account-detail-item">
              <label>Registered Email</label>
              <strong>{email}</strong>
            </div>

            <div className="account-detail-item">
              <label>Unique Worker ID</label>
              <span className="worker-id-pill">{userCode}</span>
            </div>

            <div className="account-detail-item">
              <label>Requested Role</label>
              <strong>{roleTitle}</strong>
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
              New accounts must be verified and granted access by an administrator before files and tasks are accessible.
            </p>
          </div>
        </div>

        <div className="unverified-actions-group">
          {/* Requirement 4: Preview button is displayed. ONLY when clicked does preview launch */}
          <button
            type="button"
            className="button button-primary preview-button"
            onClick={() => onPreview(role.toUpperCase(), email)}
          >
            <Eye size={18} /> Explore in Preview Mode <ArrowRight size={18} />
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => onNavigate("login", { email })}
          >
            Sign in & Verify Email
          </button>
        </div>

        <p className="preview-guidance-note">
          Preview mode allows exploring an empty workspace layout safely while your account verification is in progress.
        </p>
      </section>
    </main>
  );
}

export default PendingApproval;
