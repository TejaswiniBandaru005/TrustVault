import { useState, useEffect } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
  Files,
  UserRoundCog,
  Check,
} from "lucide-react";
import { apiRequest } from "../api";

function Login({ role, onNavigate, onAuthenticated, initialEmail }) {
  const [currentRole, setCurrentRole] = useState(role || "viewer");
  const [step, setStep] = useState("credentials");
  const [email, setEmail] = useState(
    initialEmail || (role === "admin" ? "admin123@gmail.com" : "")
  );
  const [password, setPassword] = useState(role === "admin" ? "admin@123" : "");
  const [otp, setOtp] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showPreviewFallback, setShowPreviewFallback] = useState(false);

  useEffect(() => {
    if (role) {
      setCurrentRole(role);
      if (role === "admin") {
        setEmail("admin123@gmail.com");
        setPassword("admin@123");
      } else {
        setEmail(initialEmail || "");
        setPassword("");
      }
    }
    setOtp("123456");
    setStep("credentials");
    setMessage("");
    setShowPreviewFallback(false);
  }, [role, initialEmail]);

  const handleSelectRole = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === "admin") {
      setEmail("admin123@gmail.com");
      setPassword("admin@123");
    } else {
      setEmail("");
      setPassword("");
    }
    setOtp("123456");
    setStep("credentials");
    setMessage("");
    setShowPreviewFallback(false);
    setShowRolePicker(false);
  };

  const handleLaunchPreview = () => {
    onAuthenticated({
      email: email.trim() || `guest-${currentRole}@trustvault.local`,
      role: currentRole.toUpperCase(),
      status: "APPROVED",
      isPreview: true,
    });
  };

  const requestOtp = async () => {
    const data = await apiRequest("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim(),
        password,
        role: currentRole ? currentRole.toUpperCase() : undefined,
      }),
    });

    if (currentRole && data.role && data.role.toUpperCase() !== currentRole.toUpperCase()) {
      throw new Error(
        `Access denied: You selected '${currentRole.toUpperCase()}' mode, but this account is registered as '${data.role}'.`
      );
    }

    if (data.requiresOtp === false || data.requiresOtp === "false" || data.role === "ADMIN") {
      onAuthenticated(data);
      return;
    }

    setStep("otp");
    setOtp(data.otp || "123456");
    setMessage(data.message || "Verification code 123456 has been pre-filled below.");
    setShowPreviewFallback(false);
  };

  const submitCredentials = async (event) => {
    event.preventDefault();
    setMessage("");
    setShowPreviewFallback(false);

    try {
      await requestOtp();
    } catch (error) {
      setMessage(error.message || "Cannot connect to the TrustVault backend.");
      setShowPreviewFallback(true);
    }
  };

  const submitOtp = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const user = await apiRequest("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          otp: otp || "123456",
          role: currentRole ? currentRole.toUpperCase() : undefined,
        }),
      });

      if (currentRole && user.role && user.role.toUpperCase() !== currentRole.toUpperCase()) {
        throw new Error(
          `Access denied: You selected '${currentRole.toUpperCase()}' mode, but this account is registered as '${user.role}'.`
        );
      }

      if (user.status === "PENDING_APPROVAL") {
        // Pending approval users get Preview Mode until admin grants approval
        onAuthenticated({
          ...user,
          isPreview: true,
          isPendingApproval: true,
        });
        return;
      }

      onAuthenticated(user);
    } catch (error) {
      setMessage(error.message || "Cannot connect to the TrustVault backend.");
      setShowPreviewFallback(true);
    }
  };

  const roleName = {
    viewer: "Viewer",
    owner: "Document Owner",
    admin: "Administrator",
  }[currentRole] || "Viewer";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button
          type="button"
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
            : `Enter the 6-digit verification code for ${email}.`}
        </p>

        {/* Selected Role Display & Inline Role Switcher (Does not navigate away) */}
        <div className="selected-role-note">
          <div className="selected-role-note-info">
            <span>Selected role:</span>
            <strong>{roleName}</strong>
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
            <p className="role-inline-picker-title">Switch role for sign in:</p>
            <div className="role-inline-options">
              <button
                type="button"
                className={`role-option-item ${currentRole === "viewer" ? "selected" : ""}`}
                onClick={() => handleSelectRole("viewer")}
              >
                <div className="role-option-icon"><Eye size={17} /></div>
                <div className="role-option-info">
                  <strong>Viewer</strong>
                  <span>Browse and request document access</span>
                </div>
                {currentRole === "viewer" && <Check size={16} className="role-checked" />}
              </button>

              <button
                type="button"
                className={`role-option-item ${currentRole === "owner" ? "selected" : ""}`}
                onClick={() => handleSelectRole("owner")}
              >
                <div className="role-option-icon"><Files size={17} /></div>
                <div className="role-option-info">
                  <strong>Document Owner</strong>
                  <span>Upload, share, and protect files</span>
                </div>
                {currentRole === "owner" && <Check size={16} className="role-checked" />}
              </button>

              <button
                type="button"
                className={`role-option-item ${currentRole === "admin" ? "selected" : ""}`}
                onClick={() => handleSelectRole("admin")}
              >
                <div className="role-option-icon"><UserRoundCog size={17} /></div>
                <div className="role-option-info">
                  <strong>Administrator</strong>
                  <span>Review requests and manage security</span>
                </div>
                {currentRole === "admin" && <Check size={16} className="role-checked" />}
              </button>
            </div>
          </div>
        )}

        {step === "credentials" ? (
          <form className="auth-form" onSubmit={submitCredentials}>
            <label>
              Email address or Username
              <input
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={currentRole === "admin" ? "admin123@gmail.com" : "you@company.com"}
                autoComplete="username"
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
                  placeholder={currentRole === "admin" ? "admin@123" : "Enter your password"}
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
                placeholder="123456"
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
              onClick={async () => {
                setMessage("");
                try {
                  await requestOtp();
                } catch (error) {
                  setMessage(
                    error.message || "Cannot connect to the TrustVault backend."
                  );
                }
              }}
            >
              <RefreshCw size={16} /> Resend OTP
            </button>

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

        {/* Preview mode fallback when credentials are incorrect or on request */}
        {showPreviewFallback && (
          <div className="preview-fallback-box">
            <div className="preview-fallback-header">
              <Eye size={18} />
              <strong>Incorrect credentials?</strong>
            </div>
            <p>
              You can still access and explore the full workspace interface in Preview Mode.
            </p>
            <button
              type="button"
              className="button button-secondary preview-fallback-action"
              onClick={handleLaunchPreview}
            >
              Continue in Preview Mode <ArrowRight size={16} />
            </button>
          </div>
        )}

        <div className="auth-switch">
          New to TrustVault?{" "}
          <button type="button" onClick={() => onNavigate("register")}>
            Create account
          </button>
        </div>

        <div className="auth-security-note">
          <LockKeyhole size={16} />
          <span>
            Sign-in is verified by the TrustVault server
          </span>
        </div>
      </section>
    </main>
  );
}

export default Login;
