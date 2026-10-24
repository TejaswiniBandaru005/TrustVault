import React from "react";

export default function TrustVaultLogo({
  size = 42,
  showText = true,
  caption = "SECURE ENCLAVE",
  animated = true,
  className = "",
  onClick = undefined,
}) {
  return (
    <div
      className={`trustvault-brand-root ${className} ${animated ? "hover-interactive" : ""}`}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size > 32 ? "12px" : "8px",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      <div
        className="trustvault-shield-wrap"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          viewBox="0 0 64 64"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="trustvault-shield-svg"
        >
          <defs>
            <linearGradient id="tv-dyn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary, #2563eb)" />
              <stop offset="65%" stopColor="var(--primary-hover, #1d4ed8)" />
              <stop offset="100%" stopColor="#0b1329" />
            </linearGradient>
            <linearGradient id="tv-dyn-accent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary, #38bdf8)" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
            <filter id="tv-subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Chamfered Shield */}
          <path
            d="M32 4 L55 12 C55 37 32 59 32 60 C32 59 9 37 9 12 L32 4 Z"
            fill="url(#tv-dyn-grad)"
            stroke="url(#tv-dyn-accent)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="shield-path"
          />

          {/* Concentric Rotating Dial / Vault Tumbler */}
          <circle
            cx="32"
            cy="30"
            r="14"
            stroke="url(#tv-dyn-accent)"
            strokeWidth="1.8"
            strokeDasharray="3.5 2.5"
            opacity="0.9"
            className="tumbler-ring"
          />

          {/* Core Vault Hexagon */}
          <polygon
            points="32,20 41.5,25.5 41.5,35.5 32,41 22.5,35.5 22.5,25.5"
            fill="#091024"
            stroke="url(#tv-dyn-accent)"
            strokeWidth="1.6"
            className="vault-core"
          />

          {/* Keyhole Chamber */}
          <circle cx="32" cy="28.5" r="3.2" fill="var(--primary-glow-solid, #38bdf8)" />
          <polygon
            points="30.5,29.5 33.5,29.5 34.5,36 29.5,36"
            fill="var(--primary-glow-solid, #38bdf8)"
          />

          {/* Cryptographic Zero-Trust Check Indicator */}
          <circle cx="32" cy="51" r="2.2" fill="#38bdf8" className="indicator-pip" />
        </svg>
      </div>

      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <span
            className="brand-name"
            style={{
              fontSize: size > 32 ? "21px" : "18px",
              fontWeight: 800,
              letterSpacing: "-0.6px",
              display: "flex",
              alignItems: "center",
              gap: "1px",
            }}
          >
            Trust<span style={{ color: "var(--primary)" }}>Vault</span>
          </span>
          {caption && (
            <span
              className="brand-caption"
              style={{
                fontSize: "9px",
                fontWeight: 750,
                letterSpacing: "1.8px",
                opacity: 0.75,
                textTransform: "uppercase",
              }}
            >
              {caption}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
