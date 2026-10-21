
import { useState } from "react";
import { ShieldCheck, ArrowRight, LockKeyhole } from "lucide-react";

function Register({ role, onNavigate }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const roles = {
    viewer: "Viewer",
    owner: "Document Owner",
    admin: "Administrator",
  };

  const approval = {
    viewer: "Your account request will require administrator approval.",
    owner: "Your account request will require administrator approval.",
    admin: "An existing administrator must approve your request.",
  };

  const submitRegistration = (event) => {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    onNavigate("pending");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button className="back-link" onClick={() => onNavigate("home")}>
          ← Back to TrustVault
        </button>

        <div className="auth-brand-icon">
          <ShieldCheck size={30} />
        </div>

        <h1>Create your account</h1>
        <p className="auth-description">
          Request an account to access the TrustVault workspace.
        </p>

        <div className="selected-role-note">
          <span>Requested role</span>
          <strong>{roles[role] || roles.viewer}</strong>
          <button onClick={() => onNavigate("home")}>Change</button>
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
            Phone number
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter phone number"
              autoComplete="tel"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
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
            {approval[role] || approval.viewer}
            {" "}Email verification and approval will be enforced by the backend.
          </div>

          <button className="button button-primary auth-submit" type="submit">
            Submit registration request <ArrowRight size={18} />
          </button>
        </form>

        {message && (
          <p className="form-notice" role="status">
            {message}
          </p>
        )}

        <div className="auth-switch">
          Already registered?{" "}
          <button onClick={() => onNavigate("login")}>Sign in</button>
        </div>

        <div className="auth-security-note">
          <LockKeyhole size={16} />
          <span>Registration demo · Account creation is not connected</span>
        </div>
      </section>
    </main>
  );
}

export default Register;
