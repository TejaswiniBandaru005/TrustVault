import React, { useState } from "react";
import { ShieldCheck, Copy, Check } from "lucide-react";

export default function IntegrityPill({ hash, label = "SHA-256", className = "" }) {
  const [copied, setCopied] = useState(false);

  if (!hash) return null;

  const displayHash =
    hash.length > 16 ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}` : hash;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(hash).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {});
  };

  return (
    <button
      type="button"
      className={`integrity-pill-interactive ${copied ? "copied" : ""} ${className}`}
      onClick={handleCopy}
      title={`Click to copy full SHA-256 cryptographic hash:\n${hash}`}
      aria-label="Copy SHA-256 hash"
    >
      <span className="integrity-icon-wrap">
        {copied ? (
          <Check size={12} className="copy-check-icon" strokeWidth={3} />
        ) : (
          <ShieldCheck size={12} className="shield-icon" />
        )}
      </span>
      <span className="integrity-label">{label}:</span>
      <code className="integrity-code">{displayHash}</code>
      <span className="copy-hint-text">
        {copied ? "COPIED" : <Copy size={11} className="copy-icon" />}
      </span>
    </button>
  );
}
