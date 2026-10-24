import { useState, useEffect } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  ArrowRight,
  ArrowLeft,
  Mail,
  Pencil,
  Eye,
  EyeOff,
  RefreshCw,
  Files,
  UserRoundCog,
  Check,
  CheckCircle2,
  Clock3,
  UserX,
  ShieldAlert,
  AlertTriangle,
  Info,
} from "lucide-react";
import { apiRequest } from "../api";
import TrustVaultLogo from "../components/TrustVaultLogo";
import { ROLE_DETAILS } from "./Register";

const getDefaultCredentials = (roleName) => {
  switch (roleName?.toLowerCase()) {
    case "owner":
      return { email: "owner1@example.com", password: "Owner1@123" };
    case "admin":
    case "viewer":
    default:
      // Default credentials removed for both admin and viewer as requested
      return { email: "", password: "" };
  }
};

function Login({ role, onNavigate, onAuthenticated, onPreview, initialEmail }) {
  const [currentRole, setCurrentRole] = useState(role || "viewer");
  const [step, setStep] = useState("credentials");
  const initialCreds = getDefaultCredentials(role || "viewer");
  const [email, setEmail] = useState(initialEmail || initialCreds.email);
  const [password, setPassword] = useState(initialCreds.password);
  const [otp, setOtp] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [showRolePicker, setShowRolePicker] = useState(false);

  // OTP Interactive States
  const [otpCooldown, setOtpCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccessNotice, setResendSuccessNotice] = useState("");

  // View state: "form" | "unverified" | "revoked"
  const [viewState, setViewState] = useState("form");
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [revokedEmail, setRevokedEmail] = useState("");

  // OTP cooldown countdown timer
  useEffect(() => {
    let timer;
    if (step === "otp" && otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpCooldown]);

  useEffect(() => {
    const targetRole = role || currentRole || "viewer";
    setCurrentRole(targetRole);
    if (!initialEmail) {
      const defs = getDefaultCredentials(targetRole);
      setEmail(defs.email);
      setPassword(defs.password);
    } else {
      setEmail(initialEmail);
    }
    setOtp("123456");
    setStep("credentials");
    setMessage("");
    setResendSuccessNotice("");
    setViewState("form");
  }, [role, initialEmail]);

  const handleSelectRole = (newRole) => {
    setCurrentRole(newRole);
    const defs = getDefaultCredentials(newRole);
    setEmail(defs.email);
    setPassword(defs.password);
    setOtp("123456");
    setStep("credentials");
    setMessage("");
    setResendSuccessNotice("");
    setViewState("form");
    setShowRolePicker(false);
  };

  const handleChangeEmail = () => {
    setStep("credentials");
    setMessage("");
    setResendSuccessNotice("");
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0 || isResending) return;
    setIsResending(true);
    setMessage("");
    try {
      await requestOtp();
      setOtpCooldown(30);
      setResendSuccessNotice("A fresh 6-digit code has been dispatched.");
      setTimeout(() => setResendSuccessNotice(""), 5000);
    } catch (e) {
      setMessage("Failed to resend code: " + e.message);
    } finally {
      setIsResending(false);
    }
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
      if (data.status === "PENDING_APPROVAL") {
        setUnverifiedUser(data);
        setViewState("unverified");
        return;
      }
      onAuthenticated(data);
      return;
    }

    setStep("otp");
    setOtp(data.otp || "123456");
    setOtpCooldown(30);
    setResendSuccessNotice(data.message || `Verification code sent to ${email.trim()}`);
    setTimeout(() => setResendSuccessNotice(""), 6000);
  };

  const submitCredentials = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await requestOtp();
    } catch (error) {
      const errText = error.message || "";
      if (errText.toLowerCase().includes("revoked") || errText.toLowerCase().includes("no longer")) {
        setRevokedEmail(email.trim());
        setViewState("revoked");
      } else if (errText.toLowerCase().includes("not verified") || errText.toLowerCase().includes("pending")) {
        setUnverifiedUser({
          email: email.trim(),
          role: currentRole.toUpperCase(),
          userCode: "TV-USR-PENDING",
        });
        setViewState("unverified");
      } else {
        setMessage(errText || "Cannot connect to the TrustVault backend.");
      }
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

      // Requirement 4: Unverified user -> Show access denied screen with preview button
      if (user.status === "PENDING_APPROVAL") {
        setUnverifiedUser(user);
        setViewState("unverified");
        return;
      }

      onAuthenticated(user);
    } catch (error) {
      const errText = error.message || "";
      if (errText.toLowerCase().includes("revoked") || errText.toLowerCase().includes("no longer")) {
        setRevokedEmail(email.trim());
        setViewState("revoked");
      } else if (errText.toLowerCase().includes("not verified") || errText.toLowerCase().includes("pending")) {
        setUnverifiedUser({
          email: email.trim(),
          role: currentRole.toUpperCase(),
          userCode: "TV-USR-PENDING",
        });
        setViewState("unverified");
      } else {
        setMessage(errText || "Cannot connect to the TrustVault backend.");
      }
    }
  };

  // -------------------------------------------------------------
  // View 1: Unverified User Sign In (Moves to Left Side - Req 1 & 4)
  // -------------------------------------------------------------
  if (viewState === "unverified" && unverifiedUser) {
    const roleLabel = (unverifiedUser.role || currentRole || "Viewer").toUpperCase() === "OWNER"
      ? "Document Owner"
      : "Viewer";

    return (
      <main className="auth-page layout-left">
        <section className="auth-card unverified-details-card">
          <button
            type="button"
            className="back-link"
            onClick={() => {
              setViewState("form");
              setStep("credentials");
            }}
          >
            ← Back to Sign In
          </button>

          <div className="registered-header-badge">
            <Clock3 size={18} />
            <span>Account Not Verified</span>
          </div>

          <h1>Account Verification Required</h1>
          <p className="auth-description">
            Your login credentials have been authenticated, but your access clearance is still pending review.
          </p>

          <div className="account-details-box">
            <div className="account-details-title">
              <ShieldCheck size={16} />
              <span>Identity & Worker Credentials</span>
            </div>

            <div className="account-details-grid">
              <div className="account-detail-item">
                <label>User Account</label>
                <strong>{unverifiedUser.fullName || unverifiedUser.email}</strong>
              </div>

              <div className="account-detail-item">
                <label>Registered Email</label>
                <strong>{unverifiedUser.email}</strong>
              </div>

              <div className="account-detail-item">
                <label>Worker ID</label>
                <span className="worker-id-pill">{unverifiedUser.userCode || "TV-USR-PENDING"}</span>
              </div>

              <div className="account-detail-item">
                <label>Assigned Role</label>
                <strong>{roleLabel}</strong>
              </div>

              <div className="account-detail-item full-width">
                <label>Verification Status</label>
                <span className="status-badge-pending">
                  <span className="pulsing-amber-dot" />
                  Registered as new user &middot; Pending Administrator / Owner Approval
                </span>
              </div>
            </div>
          </div>

          <div className="unverified-alert-box">
            <ShieldAlert size={22} className="unverified-alert-icon" />
            <div>
              <strong>Your account is not verified and access is not granted.</strong>
              <p>
                Registered as a new user. Please wait for an Administrator or Document Owner to verify your identity and grant access to protected documents.
              </p>
            </div>
          </div>

          <div className="unverified-actions-group">
            {/* Requirement 4: Preview button is displayed. ONLY when user clicks does preview launch */}
            <button
              type="button"
              className="button button-primary preview-button"
              onClick={() => onPreview(unverifiedUser.role || currentRole, unverifiedUser.email)}
            >
              <Eye size={18} /> Explore in Preview Mode <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setViewState("form");
                setStep("credentials");
                setEmail("");
                setPassword("");
                setMessage("");
              }}
            >
              Sign In with Another Account
            </button>
          </div>

          <p className="preview-guidance-note">
            Preview mode displays an empty workspace preview so you can verify platform features before full access is unlocked.
          </p>
        </section>
      </main>
    );
  }

  // -------------------------------------------------------------
  // View 2: Account Access Revoked (Moves to Left Side - Req 2)
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
            <span>Access Revoked</span>
          </div>

          <h1 style={{ color: "#ef4444" }}>You no longer have access to sign in</h1>
          <p className="auth-description">
            The account associated with <strong>{revokedEmail || email}</strong> has been revoked by an Administrator. Access to resources, vaults, and platform sign-in has been terminated.
          </p>

          <div className="revoked-alert-box">
            <LockKeyhole size={20} />
            <div>
              <strong>Zero-Trust Clearance Revoked</strong>
              <p>
                Platform administrators have revoked authorization for this email. If you believe this is in error, contact your system administrator.
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
                setStep("credentials");
                setEmail("");
                setPassword("");
                setMessage("");
              }}
            >
              Sign In with Another Account
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
  // View 3: Normal Sign In Form (Split 2-Container Layout with Instructions)
  // -------------------------------------------------------------
  const roleName = {
    viewer: "Viewer",
    owner: "Document Owner",
    admin: "Administrator",
  }[currentRole] || "Viewer";

  const roleInfo = ROLE_DETAILS[currentRole] || ROLE_DETAILS.viewer;
  const RoleIcon = roleInfo.icon;

  return (
    <main className="auth-page layout-split">
      <div className="register-split-wrap">
        {/* Left Container: Sign In Card */}
        <div className="register-left-col">
          <section className="auth-card register-auth-card">
            <button
              type="button"
              className="back-link"
              onClick={() => onNavigate("home")}
            >
              ← Back to TrustVault
            </button>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
              <TrustVaultLogo size={44} showText={false} animated={true} />
            </div>

            <div className="auth-tab-row">
              <button
                type="button"
                className="auth-tab-btn"
                onClick={() => onNavigate("register", { role: currentRole })}
              >
                Create Account
              </button>
              <button type="button" className="auth-tab-btn active">
                Sign In
              </button>
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

            {/* Selected Role Display & Inline Role Switcher */}
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
                    placeholder={
                      currentRole === "owner"
                        ? "owner1@example.com"
                        : currentRole === "admin"
                        ? "admin@enterprise.com"
                        : "viewer@enterprise.com"
                    }
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
                      placeholder={
                        currentRole === "owner"
                          ? "Owner1@123"
                          : "Enter password"
                      }
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
                {/* Destination Badge with interactive change button */}
                <div className="otp-destination-card">
                  <div className="otp-destination-info">
                    <div className="otp-destination-icon">
                      <Mail size={16} />
                    </div>
                    <div className="otp-destination-text">
                      <span>Verification code sent to</span>
                      <strong>{email}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="otp-change-email-pill"
                    onClick={handleChangeEmail}
                    title="Change email address"
                  >
                    <Pencil size={12} />
                    <span>Change</span>
                  </button>
                </div>

                {resendSuccessNotice && (
                  <div className="otp-success-banner" role="status">
                    <CheckCircle2 size={16} />
                    <span>{resendSuccessNotice}</span>
                  </div>
                )}

                <label>
                  One-Time Password (OTP)
                  <div className="otp-input-wrapper">
                    <input
                      type="text"
                      className="otp-input-large"
                      value={otp}
                      onChange={(event) => {
                        const val = event.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtp(val);
                      }}
                      placeholder="· · · · · ·"
                      maxLength={6}
                      autoComplete="one-time-code"
                      autoFocus
                      required
                    />
                    <div className="otp-hint-badge">
                      <LockKeyhole size={13} />
                      <span>Zero-Trust 2FA Security Token</span>
                    </div>
                  </div>
                </label>

                {/* Highly Interactive Options Bar: Resend OTP and Change Email */}
                <div className="otp-interactive-bar">
                  <button
                    type="button"
                    className={`otp-bar-btn resend ${otpCooldown > 0 || isResending ? "cooldown" : ""}`}
                    disabled={otpCooldown > 0 || isResending}
                    onClick={handleResendOtp}
                    title={otpCooldown > 0 ? `Wait ${otpCooldown} seconds to resend` : "Send a new code"}
                  >
                    <RefreshCw size={14} className={isResending ? "spin-icon" : ""} />
                    <span>
                      {isResending
                        ? "Sending..."
                        : otpCooldown > 0
                        ? `Resend OTP (${otpCooldown}s)`
                        : "Resend OTP"}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="otp-bar-btn change"
                    onClick={handleChangeEmail}
                    title="Return to enter a different email address"
                  >
                    <ArrowLeft size={14} />
                    <span>Change Email</span>
                  </button>
                </div>

                <button
                  className="button button-primary auth-submit"
                  type="submit"
                >
                  Verify OTP & Sign In <ArrowRight size={18} />
                </button>
              </form>
            )}

            {message && (
              <div className="register-error-banner" role="alert" style={{ marginTop: "18px" }}>
                <AlertTriangle size={18} />
                <div>
                  <strong>{message}</strong>
                </div>
              </div>
            )}

            <div className="auth-switch">
              Need an account?{" "}
              <button type="button" onClick={() => onNavigate("register", { role: currentRole })}>
                Create one
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

export default Login;
