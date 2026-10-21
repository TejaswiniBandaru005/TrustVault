
import { useState } from "react";
import { ShieldCheck, ArrowRight, LockKeyhole } from "lucide-react";

function ForgotPassword({ onNavigate }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usePhone, setUsePhone] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    if (step === "email") {
      setMessage(
        "Demo only: no email OTP was sent. Backend verification is required."
      );
      return;
    }

    if (step === "phone") {
      setMessage(
        "Demo only: no SMS OTP was sent. Backend verification is required."
      );
      return;
    }

    if (step === "password") {
      if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }

      setMessage(
        "Password reset is not connected. Your password has not been changed."
      );
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button className="back-link" onClick={() => onNavigate("login")}>
          ← Back to sign in
        </button>

        <div className="auth-brand-icon">
          <ShieldCheck size={30} />
        </div>

        <h1>Reset your password</h1>
        <p className="auth-description">
          Verify your identity before creating a new password.
        </p>

        <div className="recovery-steps">
          <span className={step === "email" ? "active" : ""}>1. Email</span>
          <span className={step === "phone" ? "active" : ""}>2. Phone</span>
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

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={usePhone}
                  onChange={(event) => setUsePhone(event.target.checked)}
                />
                Also require phone OTP verification
              </label>

              <button
                type="button"
                className="button button-secondary auth-submit"
                onClick={() => {
                  if (!email.trim()) {
                    setMessage("Enter your registered email first.");
                    return;
                  }
                  setMessage("");
                  setStep("emailOtp");
                }}
              >
                Continue to email verification <ArrowRight size={18} />
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
                  placeholder="Enter 6-digit code"
                  minLength={6}
                  maxLength={6}
                  required
                />
              </label>

              <p className="form-notice">
                Demo only: no OTP has been sent or verified.
              </p>

              <button
                type="button"
                className="button button-primary auth-submit"
                onClick={() => {
                  setMessage(
                    "Email OTP verification requires the backend. No verification has occurred."
                  );
                }}
              >
                Verify email OTP <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="back-link"
                onClick={() => {
                  setMessage("");
                  setStep("email");
                }}
              >
                Change email
              </button>

              <button
                type="button"
                className="button button-secondary auth-submit"
                onClick={() => {
                  setMessage("");
                  setStep(usePhone ? "phone" : "password");
                }}
              >
                Continue in demo mode
              </button>
            </>
          )}

          {step === "phone" && (
            <>
              <label>
                Phone number
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Registered phone number"
                  autoComplete="tel"
                  required
                />
              </label>

              <label>
                Phone verification code
                <input
                  inputMode="numeric"
                  value={phoneOtp}
                  onChange={(event) =>
                    setPhoneOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter SMS code"
                  minLength={6}
                  maxLength={6}
                  required
                />
              </label>

              <p className="form-notice">
                Demo only: SMS delivery and OTP verification are not connected.
              </p>

              <button
                type="submit"
                className="button button-primary auth-submit"
              >
                Continue <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="back-link"
                onClick={() => {
                  setMessage("");
                  setStep("emailOtp");
                }}
              >
                ← Back to email verification
              </button>

              <button
                type="button"
                className="button button-secondary auth-submit"
                onClick={() => {
                  setMessage("");
                  setStep("password");
                }}
              >
                Continue in demo mode
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
                  placeholder="Create a new password"
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
                  placeholder="Re-enter your password"
                  required
                />
              </label>

              <button
                type="submit"
                className="button button-primary auth-submit"
              >
                Reset password <ArrowRight size={18} />
              </button>
            </>
          )}
        </form>

        {message && (
          <p className="form-notice" role="status">
            {message}
          </p>
        )}

        <div className="auth-security-note">
          <LockKeyhole size={16} />
          <span>Never share an OTP with anyone. Reset is demo-only.</span>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
