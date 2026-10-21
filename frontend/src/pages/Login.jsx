
import { useState } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

function Login({ role, onNavigate, onAuthenticated }) {
  const [step, setStep] = useState("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const submitCredentials = (event) => {
    event.preventDefault();
    setMessage("");

    // Demo only: never treat client-side validation as authentication.
    setStep("otp");
    setMessage(
      "Demo mode: no email was sent. Real OTP verification requires the backend."
    );
  };

  const submitOtp = (event) => {
    event.preventDefault();
    setMessage(
      "OTP verification is not connected yet. No account has been authenticated."
    );
  };

  const roleName = {
    viewer: "Viewer",
    owner: "Document Owner",
    admin: "Administrator",
  }[role] || "Viewer";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button
          className="back-link"
          onClick={() => onNavigate("home")}
        >
          ← Back to TrustVault
        </button>

        <div className="auth-brand-icon">
          <ShieldCheck size={30} />
        </div>

        <h1>
          {step === "credentials"
            ? "Welcome back"
            : "Verify your email"}
        </h1>

        <p className="auth-description">
          {step === "credentials"
            ? "Sign in to continue to your secure workspace."
            : `Enter the verification code sent to ${email}.`}
        </p>

        <div className="selected-role-note">
          <span>Selected role</span>
          <strong>{roleName}</strong>
          <button onClick={() => onNavigate("home")}>
            Change
          </button>
        </div>

        {step === "credentials" ? (
          <form className="auth-form" onSubmit={submitCredentials}>
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
              <div className="password-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </label>

            <button
              type="button"
              className="forgot-link"
              onClick={() => onNavigate("forgot")}
            >
              Forgot password?
            </button>

            <button
              className="button button-primary auth-submit"
              type="submit"
            >
              Continue <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={submitOtp}>
            <label>
              Email verification code
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="Enter 6-digit code"
                minLength={6}
                maxLength={6}
                required
              />
            </label>

            <button
              className="button button-primary auth-submit"
              type="submit"
            >
              Verify and sign in <ArrowRight size={18} />
            </button>

            <button
              className="button button-secondary auth-submit"
              type="button"
              onClick={() =>
                setMessage(
                  "OTP resend will be available after backend integration."
                )
              }
            >
              <RefreshCw size={16} /> Resend OTP
            </button>

            {/* Temporary dashboard preview navigation */}
            {role === "viewer" && (
              <button
                type="button"
                className="button button-secondary auth-submit"
                onClick={() => onNavigate("viewer")}
              >
                Preview Viewer Dashboard (Demo)
              </button>
            )}
            {role === "owner" && (
              <button
                type="button"
                className="button button-secondary auth-submit"
                onClick={() => onNavigate("owner")}
              >
                Preview Owner Dashboard (Demo)
              </button>
            )}
            {role === "admin" && (
                <button
                    type="button"
                    className="button button-secondary auth-submit"
                    onClick={() => onNavigate("admin")}
                >
                Preview Admin Dashboard (Demo)
                </button>
            )}

            <button
              className="back-link"
              type="button"
              onClick={() => setStep("credentials")}
            >
              ← Back to credentials
            </button>
          </form>
        )}

        {message && (
          <p className="form-notice" role="status">
            {message}
          </p>
        )}

        <div className="auth-switch">
          New to TrustVault?{" "}
          <button onClick={() => onNavigate("register")}>
            Create account
          </button>
        </div>

        <div className="auth-security-note">
          <LockKeyhole size={16} />
          <span>
            Demo UI only · Authentication is not connected
          </span>
        </div>
      </section>
    </main>
  );
}

export default Login;
