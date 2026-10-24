import React from "react";
import { ShieldAlert, ShieldCheck, Lock, Eye } from "lucide-react";

export default function SecurityClearanceBadge({ level = "CONFIDENTIAL", className = "" }) {
  const norm = (level || "CONFIDENTIAL").toUpperCase().replace(/\s+/g, "_");

  const configs = {
    TOP_SECRET: {
      label: "TOP SECRET",
      icon: ShieldAlert,
      variantClass: "clearance-top-secret",
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.12)",
      border: "rgba(239, 68, 68, 0.3)",
    },
    SECRET: {
      label: "SECRET",
      icon: Lock,
      variantClass: "clearance-secret",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.3)",
    },
    RESTRICTED: {
      label: "RESTRICTED",
      icon: Lock,
      variantClass: "clearance-restricted",
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.12)",
      border: "rgba(139, 92, 246, 0.3)",
    },
    CONFIDENTIAL: {
      label: "CONFIDENTIAL",
      icon: ShieldCheck,
      variantClass: "clearance-confidential",
      color: "var(--primary, #2563eb)",
      bg: "var(--accent-soft, rgba(37, 99, 235, 0.1))",
      border: "var(--primary, rgba(37, 99, 235, 0.3))",
    },
    INTERNAL: {
      label: "INTERNAL",
      icon: Eye,
      variantClass: "clearance-internal",
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.3)",
    },
  };

  const current = configs[norm] || configs.CONFIDENTIAL;
  const Icon = current.icon;

  return (
    <span
      className={`security-clearance-badge ${current.variantClass} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 9px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 750,
        letterSpacing: "0.6px",
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        color: current.color,
      }}
      title={`Security Enclave Clearance: ${current.label}`}
    >
      <span className="clearance-beacon-dot" style={{ backgroundColor: current.color }} />
      <Icon size={12} strokeWidth={2.5} />
      <span>{current.label}</span>
    </span>
  );
}
