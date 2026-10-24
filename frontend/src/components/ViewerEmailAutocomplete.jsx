import React, { useState, useEffect, useRef } from "react";
import { User, Check, Search, AtSign } from "lucide-react";
import { apiRequest } from "../api";

export default function ViewerEmailAutocomplete({
  value,
  onChange,
  onSelectViewer,
  placeholder = "Type viewer email (e.g. viewer@...)",
  required = true,
  disabled = false,
  className = "",
}) {
  const [viewers, setViewers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchViewers = async () => {
      setIsLoading(true);
      try {
        // Try dedicated viewers endpoint first
        let list = await apiRequest("/api/documents/viewers").catch(() => null);
        if (!list || !Array.isArray(list) || list.length === 0) {
          // Fallback to admin users list if available
          const users = await apiRequest("/api/admin/users").catch(() => null);
          if (Array.isArray(users)) {
            list = users
              .filter(
                (u) =>
                  (u.role || "").toUpperCase() === "VIEWER" &&
                  u.status !== "Revoked"
              )
              .map((u) => ({
                email: u.email,
                name: u.name || u.email,
                userCode: u.userCode || "",
              }));
          }
        }

        if (isMounted && Array.isArray(list) && list.length > 0) {
          // Deduplicate by email
          const seen = new Set();
          const clean = [];
          for (const item of list) {
            const em = (item.email || "").toLowerCase().trim();
            if (em && !seen.has(em)) {
              seen.add(em);
              clean.push({
                email: em,
                name: item.name || em,
                userCode: item.userCode || "",
              });
            }
          }
          setViewers(clean);
        }
      } catch (err) {
        console.warn("Could not load viewers list for autocomplete:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchViewers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter viewers by input starting letters or containing query
  const query = (value || "").toLowerCase().trim();
  const filtered = viewers.filter((v) => {
    if (!query) return true;
    const em = v.email.toLowerCase();
    const nm = (v.name || "").toLowerCase();
    // Prioritize starting letters matching, but also allow contains
    return em.startsWith(query) || nm.startsWith(query) || em.includes(query);
  });

  // Sort so exact prefix matches come first
  const sortedFiltered = [...filtered].sort((a, b) => {
    if (!query) return 0;
    const aStarts = a.email.toLowerCase().startsWith(query);
    const bStarts = b.email.toLowerCase().startsWith(query);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.email.localeCompare(b.email);
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (viewer) => {
    onChange(viewer.email);
    if (onSelectViewer) onSelectViewer(viewer);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < sortedFiltered.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : sortedFiltered.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0 && sortedFiltered[highlightedIndex]) {
      e.preventDefault();
      handleSelect(sortedFiltered[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Helper to render matched prefix highlighting
  const renderHighlighted = (text, match) => {
    if (!match) return text;
    const lower = text.toLowerCase();
    const mLower = match.toLowerCase();
    const idx = lower.indexOf(mLower);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="email-autocomplete-match">{text.slice(idx, idx + match.length)}</span>
        {text.slice(idx + match.length)}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`email-autocomplete-container ${className}`}
      style={{ position: "relative", width: "100%" }}
    >
      <div className="email-autocomplete-input-wrap">
        <AtSign size={16} className="email-autocomplete-icon" />
        <input
          ref={inputRef}
          type="email"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          className="email-autocomplete-input"
        />
        {sortedFiltered.length > 0 && (
          <span className="email-autocomplete-badge" title="Matching registered viewers">
            {sortedFiltered.length} viewer{sortedFiltered.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Quick Select Viewer Chips */}
      {viewers.length > 0 && !query && (
        <div className="email-autocomplete-chips-tray">
          <span className="email-autocomplete-chips-label">Available viewers:</span>
          <div className="email-autocomplete-chips">
            {viewers.slice(0, 4).map((v) => (
              <button
                type="button"
                key={v.email}
                className={`email-autocomplete-chip ${
                  (value || "").toLowerCase() === v.email.toLowerCase()
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleSelect(v)}
                title={`Select ${v.name} (${v.email})`}
              >
                <span className="chip-avatar">{v.email[0].toUpperCase()}</span>
                <span className="chip-text">{v.email}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Animated Autocomplete Menu */}
      {isOpen && (
        <div className="email-autocomplete-dropdown">
          <div className="email-autocomplete-header">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Search size={13} />
              {query ? `Viewers matching "${query}"` : "All Registered Viewers"}
            </span>
            <span className="email-autocomplete-count">
              {sortedFiltered.length} found
            </span>
          </div>

          <div className="email-autocomplete-list">
            {sortedFiltered.length === 0 ? (
              <div className="email-autocomplete-empty">
                {isLoading ? (
                  <span>Loading viewers directory...</span>
                ) : (
                  <span>
                    No registered viewer starting with <strong>"{query}"</strong>.
                    <br />
                    <small>You can still enter a custom email manually.</small>
                  </span>
                )}
              </div>
            ) : (
              sortedFiltered.map((viewer, idx) => {
                const isSelected = (value || "").toLowerCase() === viewer.email.toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={viewer.email}
                    className={`email-autocomplete-item ${
                      isHighlighted ? "highlighted" : ""
                    } ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(viewer)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <div className="email-autocomplete-avatar">
                      <User size={15} />
                    </div>
                    <div className="email-autocomplete-info">
                      <div className="email-autocomplete-email">
                        {renderHighlighted(viewer.email, query)}
                      </div>
                      <div className="email-autocomplete-name">
                        {viewer.name}
                        {viewer.userCode && (
                          <span className="email-autocomplete-code">
                            {viewer.userCode}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={16} className="email-autocomplete-check" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
