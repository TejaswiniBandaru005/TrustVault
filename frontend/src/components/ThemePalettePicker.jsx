import React, { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { THEME_PALETTES, getPalette } from "../types/theme";

export default function ThemePalettePicker({ currentPaletteId, onSelectPalette }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const activePalette = getPalette(currentPaletteId);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="palette-picker-container" ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="palette-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Customize theme palette"
        title={`Current Palette: ${activePalette.name} (Click to change)`}
      >
        <span
          className="palette-swatch-pip"
          style={{
            backgroundColor: activePalette.dotColor,
            boxShadow: `0 0 10px ${activePalette.glow}`,
          }}
        />
        <Palette size={16} />
        <span className="palette-trigger-label">{activePalette.name.split(" ")[0]}</span>
      </button>

      {isOpen && (
        <div className="palette-dropdown-popover" role="dialog" aria-label="Theme Color Palettes">
          <div className="palette-popover-header">
            <div>
              <div className="palette-popover-title">Color Palette</div>
              <div className="palette-popover-sub">Personalize TrustVault accent</div>
            </div>
            <div
              className="palette-active-pill"
              style={{
                backgroundColor: activePalette.accentSoft,
                color: activePalette.primary,
              }}
            >
              Active
            </div>
          </div>

          <div className="palette-options-grid">
            {THEME_PALETTES.map((item) => {
              const isSelected = item.id === activePalette.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`palette-option-card ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    onSelectPalette(item.id);
                    setIsOpen(false);
                  }}
                  style={{
                    "--card-accent": item.primary,
                    "--card-glow": item.glow,
                  }}
                >
                  <div
                    className="palette-color-preview"
                    style={{
                      background: item.gradient,
                      boxShadow: isSelected ? `0 0 12px ${item.glow}` : "none",
                    }}
                  >
                    {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </div>

                  <div className="palette-card-info">
                    <span className="palette-card-name">{item.name}</span>
                    <span className="palette-card-tagline">{item.tagline}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="palette-popover-footer">
            <span>Dynamic CSS theme • Persists across sessions</span>
          </div>
        </div>
      )}
    </div>
  );
}
