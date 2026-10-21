
import { ShieldCheck, Clock3, ArrowRight, LockKeyhole } from "lucide-react";

function PendingApproval({ onNavigate }) {
  return (
    <main className="auth-page">
      <section className="auth-card approval-card">
        <div className="approval-status-icon">
          <Clock3 size={34} />
        </div>

        <span className="section-kicker">ACCOUNT STATUS</span>
        <h1>Approval pending</h1>

        <p className="auth-description">
          Your registration request needs to be reviewed before your account
          can access TrustVault.
        </p>

        <div className="approval-timeline">
          <div className="approval-step completed">
            <span>✓</span>
            <div>
              <strong>Registration submitted</strong>
              <p>Your request has been prepared.</p>
            </div>
          </div>

          <div className="approval-step current">
            <span>2</span>
            <div>
              <strong>Administrator review</strong>
              <p>Your account is waiting for approval.</p>
            </div>
          </div>

          <div className="approval-step">
            <span>3</span>
            <div>
              <strong>Account activation</strong>
              <p>Access becomes available after server-side approval.</p>
            </div>
          </div>
        </div>

        <p className="form-notice">
          Preview only: no registration request has been saved or sent to an
          administrator.
        </p>

        <button
          className="button button-primary auth-submit"
          onClick={() => onNavigate("login")}
        >
          Return to sign in <ArrowRight size={18} />
        </button>

        <div className="auth-security-note">
          <LockKeyhole size={16} />
          <span>
            <ShieldCheck size={16} /> Approval is required before protected access.
          </span>
        </div>
      </section>
    </main>
  );
}

export default PendingApproval;
