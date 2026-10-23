import { Clock3, ArrowRight, LockKeyhole, Eye, CheckCircle2 } from "lucide-react";

function PendingApproval({ pendingData, onNavigate, onPreview }) {
  const email = pendingData?.email || "";
  const role = pendingData?.role || "viewer";

  const roleTitle = {
    viewer: "Viewer",
    owner: "Document Owner",
    admin: "Administrator",
  }[role.toLowerCase()] || "Viewer";

  return (
    <main className="auth-page">
      <section className="auth-card approval-card">
        <div className="approval-status-icon">
          <Clock3 size={34} />
        </div>

        <span className="section-kicker">ACCOUNT STATUS</span>
        <h1>Registration Complete</h1>

        <p className="auth-description">
          {email ? (
            <>
              Account for <strong>{email}</strong> ({roleTitle}) has been created successfully.
            </>
          ) : (
            "Your account registration was successful."
          )}
        </p>

        <div className="pending-status-alert">
          <Clock3 size={20} className="pending-alert-icon" />
          <div className="pending-alert-body">
            <strong>Awaiting Administrator Approval</strong>
            <p>
              New {roleTitle} accounts must be reviewed and approved by an Administrator
              before full access to files and permissions is granted.
            </p>
          </div>
        </div>

        <div className="approval-timeline">
          <div className="approval-step completed">
            <span>✓</span>
            <div>
              <strong>1. Account Created</strong>
              <p>Your credentials are encrypted in Neon PostgreSQL.</p>
            </div>
          </div>

          <div className="approval-step completed">
            <span>✓</span>
            <div>
              <strong>2. Email Verification Ready</strong>
              <p>Email OTP verification is configured.</p>
            </div>
          </div>

          <div className="approval-step current">
            <span>3</span>
            <div>
              <strong>3. Administrator Approval</strong>
              <p>Account requires admin grant before active access.</p>
            </div>
          </div>
        </div>

        <div className="pending-actions-group">
          {/* Requirement 5: For every new user show preview option until admin gives access */}
          <button
            type="button"
            className="button button-primary auth-submit preview-explore-btn"
            onClick={() => onPreview(role.toUpperCase(), email)}
          >
            <Eye size={18} /> Explore in Preview Mode <ArrowRight size={18} />
          </button>

          <button
            type="button"
            className="button button-secondary auth-submit"
            onClick={() => onNavigate("login")}
          >
            Sign in & Verify Email
          </button>
        </div>

        <div className="auth-security-note">
          <LockKeyhole size={16} />
          <span>
            <CheckCircle2 size={16} /> Preview mode allows viewing the workspace safely.
          </span>
        </div>
      </section>
    </main>
  );
}

export default PendingApproval;
