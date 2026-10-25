import React, { useState, useEffect, useRef } from "react";
import { User, Check, Search, AtSign, Shield } from "lucide-react";
import { apiRequest } from "../api";

export default function ViewerEmailAutocomplete({
  value,
  onChange,
  onSelectViewer,
  usersList = null,
  allowedRoles = ["VIEWER", "OWNER"],
  placeholder = "Type viewer or owner email (e.g. user@...)",
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
    // If parent passed explicit usersList (e.g. from AdminDashboard), use it directly
    if (Array.isArray(usersList) && usersList.length > 0) {
      const normalizedRoles = allowedRoles.map((r) => r.toUpperCase());
      const seen = new Set();
      const clean = [];
      for (const u of usersList) {
        const em = (u.email || "").toLowerCase().trim();
        const roleUpper = (u.role || "").toUpperCase();
        const statusUpper = (u.status || "").toUpperCase();
        if (
          em &&
          !seen.has(em) &&
          statusUpper !== "REVOKED" &&
          (normalizedRoles.includes(roleUpper) || normalizedRoles.length === 0)
        ) {
          seen.add(em);
          clean.push({
            email: em,
            name: u.name || em,
            role: roleUpper === "OWNER" ? "Owner" : "Viewer",
            userCode: u.userCode || "",
          });
        }
      }
      setViewers(clean);
      return;
    }

    let isMounted = true;
    const fetchViewers = async () => {
      setIsLoading(true);
      try {
        // Try dedicated viewers & owners endpoint
        let list = await apiRequest("/api/documents/viewers?includeOwners=true").catch(() => null);
        if (!list || !Array.isArray(list) || list.length === 0) {
          // Fallback to admin users list if available
          const users = await apiRequest("/api/admin/users").catch(() => null);
          if (Array.isArray(users)) {
            const normalizedRoles = allowedRoles.map((r) => r.toUpperCase());
            list = users
              .filter(
                (u) =>
                  normalizedRoles.includes((u.role || "").toUpperCase()) &&
                  (u.status || "").toUpperCase() !== "REVOKED"
              )
              .map((u) => ({
                email: u.email,
                name: u.name || u.email,
                role: (u.role || "").toUpperCase() === "OWNER" ? "Owner" : "Viewer",
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
                role: (item.role || "").toUpperCase() === "OWNER" ? "Owner" : "Viewer",
                userCode: item.userCode || "",
              });
            }
          }
          setViewers(clean);
        }
      } catch (err) {
        console.warn("Could not load users list for autocomplete:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchViewers();
    return () => {
      isMounted = false;
    };
  }, [usersList, allowedRoles]);

  // Filter users by input starting letters or containing query
  const query = (value || "").toLowerCase().trim();
  const filtered = viewers.filter((v) => {
    if (!query) return true;
    const em = v.email.toLowerCase();
    const nm = (v.name || "").toLowerCase();
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

  const handleSelect = (user) => {
    onChange(user.email);
    if (onSelectViewer) onSelectViewer(user);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
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
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && sortedFiltered[highlightedIndex]) {
        e.preventDefault();
        handleSelect(sortedFiltered[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const renderHighlighted = (text, q) => {
    if (!q) return text;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === -1) return text;

    return (
      <>
        {text.substring(0, idx)}
        <mark className="email-autocomplete-highlight">
          {text.substring(idx, idx + q.length)}
        </mark>
        {text.substring(idx + q.length)}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`email-autocomplete-container ${className}`}
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
          <span className="email-autocomplete-badge" title="Matching registered users">
            {sortedFiltered.length} user{sortedFiltered.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Quick Select Chips
      {viewers.length > 0 && !query && (
        <div className="email-autocomplete-chips-tray">
          <span className="email-autocomplete-chips-label">Quick select user:</span>
          <div className="email-autocomplete-chips">
            {viewers.slice(0, 5).map((v) => (
              <button
                type="button"
                key={v.email}
                className={`email-autocomplete-chip ${
                  (value || "").toLowerCase() === v.email.toLowerCase()
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleSelect(v)}
                title={`Select ${v.name} (${v.email}) [${v.role}]`}
              >
                <span className="chip-avatar">{v.email[0].toUpperCase()}</span>
                <span className="chip-text">{v.email}</span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    opacity: 0.8,
                    marginLeft: "2px",
                    fontWeight: 700,
                  }}
                >
                  [{v.role}]
                </span>
              </button>
            ))}
          </div>
        </div>
      )} */}

      {/* Floating Animated Autocomplete Menu */}
      {isOpen && (
        <div className="email-autocomplete-dropdown">
          <div className="email-autocomplete-header">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Search size={13} />
              {query ? `Users matching "${query}"` : "Registered Viewers & Owners"}
            </span>
            <span className="email-autocomplete-count">
              {sortedFiltered.length} found
            </span>
          </div>

          <div className="email-autocomplete-list">
            {sortedFiltered.length === 0 ? (
              <div className="email-autocomplete-empty">
                {isLoading ? (
                  <span>Loading user directory...</span>
                ) : (
                  <span>
                    No registered user starting with <strong>"{query}"</strong>.
                    <br />
                    <small>You can still enter a custom email manually.</small>
                  </span>
                )}
              </div>
            ) : (
              sortedFiltered.map((u, idx) => {
                const isSelected = (value || "").toLowerCase() === u.email.toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={u.email}
                    className={`email-autocomplete-item ${
                      isHighlighted ? "highlighted" : ""
                    } ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(u)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <div className="email-autocomplete-avatar">
                      <User size={15} />
                    </div>
                    <div className="email-autocomplete-info">
                      <div className="email-autocomplete-email">
                        {renderHighlighted(u.email, query)}
                      </div>
                      <div className="email-autocomplete-name">
                        {u.name}
                        <span
                          style={{
                            marginLeft: "6px",
                            padding: "1px 6px",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            backgroundColor:
                              u.role === "Owner"
                                ? "rgba(147, 51, 234, 0.15)"
                                : "rgba(14, 165, 233, 0.15)",
                            color:
                              u.role === "Owner" ? "#9333ea" : "#0284c7",
                          }}
                        >
                          {u.role}
                        </span>
                        {u.userCode && (
                          <span className="email-autocomplete-code">
                            {u.userCode}
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
