import { useState } from "react";
import { ShieldCheck, ArrowRight, LockKeyhole } from "lucide-react";
import { apiRequest } from "../api";

function Register({ role, onNavigate }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = {
    viewer: "Viewer",
    owner: "Document Owner",
    admin: "Administrator",
  };

  const registrationMessage = {
    viewer: "Your Viewer registration requires Administrator approval before full document access is enabled.",
    owner: "Your Document Owner registration requires Administrator approval before file management is enabled.",
    admin: "Administrator accounts cannot be self-registered.",
  };
  const canRegister = role !== "admin";

  const submitRegistration = async (event) => {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role: role.toUpperCase(),
        }),
      });
      // Transition directly to Pending Approval screen with user data
      onNavigate("pending", {
        email: email.trim(),
        role: role.toLowerCase(),
        fullName: fullName.trim(),
      });
    } catch (error) {
      setMessage(error.message || "Cannot connect to the TrustVault backend.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button type="button" className="back-link" onClick={() => onNavigate("home")}>
          ← Back to TrustVault
        </button>

        <div className="auth-brand-icon">
          <ShieldCheck size={30} />
        </div>

        <h1>Create your account</h1>
        <p className="auth-description">
          Register to join the TrustVault secure document workspace.
        </p>

        <div className="selected-role-note">
          <div>
            <span>Requested role</span>
            <strong>{roles[role] || roles.viewer}</strong>
          </div>
          <button type="button" onClick={() => onNavigate("home")}>Change</button>
        </div>

        <form className="auth-form" onSubmit={submitRegistration}>
          <label>
            Full name
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
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
            {registrationMessage[role] || registrationMessage.viewer}
          </div>

          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={!canRegister || isSubmitting}
          >
            {isSubmitting
              ? "Creating account..."
              : canRegister
              ? "Register Account"
              : "Administrator registration unavailable"}
            {canRegister && <ArrowRight size={18} />}
          </button>
        </form>

        {message && (
          <p className="form-notice" role="status">
            {message}
          </p>
        )}

        <div className="auth-switch">
          Already registered?{" "}
          <button type="button" onClick={() => onNavigate("login")}>Sign in</button>
        </div>

        <div className="auth-security-note">
          <LockKeyhole size={16} />
          <span>Registration is encrypted and handled by the TrustVault server</span>
        </div>
      </section>
    </main>
  );
}

export default Register;
