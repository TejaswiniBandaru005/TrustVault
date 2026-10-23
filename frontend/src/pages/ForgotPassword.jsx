import { useState } from "react";
import { ShieldCheck, ArrowRight, LockKeyhole, RefreshCw, KeyRound, CheckCircle2 } from "lucide-react";
import { apiRequest } from "../api";

function ForgotPassword({ onNavigate }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountNotFound, setAccountNotFound] = useState(false);

  const requestResetOtp = async (targetEmail) => {
    setIsSubmitting(true);
    setAccountNotFound(false);
    try {
      const result = await apiRequest("/api/auth/password-reset/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: targetEmail.trim() }),
      });
      setStep("emailOtp");
      setEmailOtp(result.otp || "654321");
      setMessage(result.message || "Verification code pre-filled below.");
    } catch (error) {
      const errMsg = error.message || "Cannot connect to the TrustVault backend.";
      setMessage(errMsg);
      if (errMsg.toLowerCase().includes("no account found") || errMsg.toLowerCase().includes("not found")) {
        setAccountNotFound(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (step === "email") {
      if (!email.trim()) {
        setMessage("Please enter your registered email address.");
        return;
      }
      await requestResetOtp(email);
      return;
    }

    if (step === "emailOtp") {
      if (!emailOtp || emailOtp.trim().length !== 6) {
        setMessage("Please enter the 6-digit verification code.");
        return;
      }
      setStep("password");
      setMessage("");
      return;
    }

    if (step === "password") {
      if (newPassword.length < 8) {
        setMessage("Password must be at least 8 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await apiRequest("/api/auth/password-reset", {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            otp: emailOtp.trim(),
            newPassword,
          }),
        });
        setMessage(result.message || "Password reset successfully.");
        setStep("complete");
      } catch (error) {
        setMessage(error.message || "Cannot connect to the TrustVault backend.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button type="button" className="back-link" onClick={() => onNavigate("login")}>
          ← Back to sign in
        </button>

        <div className="auth-brand-icon">
          <ShieldCheck size={30} />
        </div>

        <h1>Reset your password</h1>
        <p className="auth-description">
          {step === "email" && "Enter your registered email to receive a verification code."}
          {step === "emailOtp" && `Enter the 6-digit verification code for ${email}.`}
          {step === "password" && "Create a secure new password for your account."}
          {step === "complete" && "Your password has been changed successfully."}
        </p>

        <div className="recovery-steps">
          <span className={step === "email" ? "active" : ""}>1. Email</span>
          <span className={step === "emailOtp" ? "active" : ""}>2. Verify</span>
          <span className={step === "password" ? "active" : ""}>3. Reset</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {step === "email" && (
            <>
              <label>
                Registered email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </label>

              <button
                type="submit"
                className="button button-primary auth-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending code..." : "Send verification code"} <ArrowRight size={18} />
              </button>
            </>
          )}

          {step === "emailOtp" && (
            <>
              <label>
                Email verification code
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={emailOtp}
                  onChange={(event) =>
                    setEmailOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="654321"
                  minLength={6}
                  maxLength={6}
                  required
                />
              </label>

              <button
                type="submit"
                className="button button-primary auth-submit"
              >
                Continue to password <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="button button-secondary auth-submit"
                disabled={isSubmitting}
                onClick={() => requestResetOtp(email)}
              >
                <RefreshCw size={16} /> Resend code
              </button>

              <button
                type="button"
                className="back-link"
                onClick={() => {
                  setMessage("");
                  setStep("email");
                }}
              >
                ← Change email
              </button>
            </>
          )}

          {step === "password" && (
            <>
              <label>
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="Create a new password (min 8 chars)"
                  required
                />
              </label>

              <label>
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="Re-enter your new password"
                  required
                />
              </label>

              <button
                type="submit"
                className="button button-primary auth-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Reset password"} <ArrowRight size={18} />
              </button>
            </>
          )}

          {step === "complete" && (
            <div className="reset-complete-box">
              <CheckCircle2 size={36} style={{ color: "#16a34a", margin: "10px auto" }} />
              <button
                type="button"
                className="button button-primary auth-submit"
                onClick={() => onNavigate("login")}
              >
                Sign in with new password <ArrowRight size={18} />
              </button>
            </div>
          )}
        </form>

        {message && (
          <p className="form-notice" role="status">
            {message}
          </p>
        )}

        {accountNotFound && (
          <div className="preview-fallback-box" style={{ marginTop: "12px" }}>
            <p>Don't have an account yet with this email?</p>
            <button
              type="button"
              className="button button-secondary preview-fallback-action"
              onClick={() => onNavigate("register")}
            >
              Create a new account <ArrowRight size={16} />
            </button>
          </div>
        )}

        <div className="auth-security-note">
          <LockKeyhole size={16} />
          <span>Password reset is encrypted and verified by the TrustVault server.</span>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
