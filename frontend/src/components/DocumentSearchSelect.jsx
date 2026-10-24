import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, FileText, Check, ChevronDown, X, Clock, Shield } from "lucide-react";

export default function DocumentSearchSelect({
  documents = [],
  value = "",
  onChange,
  placeholder = "Search and select document (or type to filter)...",
  required = true,
  theme = "light",
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Recently added documents should display at the top
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.updatedAt || a.updated || 0).getTime();
      const timeB = new Date(b.createdAt || b.updatedAt || b.updated || 0).getTime();
      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        return timeB - timeA; // Descending (newest on top)
      }
      return (Number(b.id) || 0) - (Number(a.id) || 0); // Descending ID
    });
  }, [documents]);

  // Selected document object
  const selectedDoc = useMemo(() => {
    return sortedDocuments.find((d) => String(d.id) === String(value)) || null;
  }, [sortedDocuments, value]);

  // Filter based on user typing
  const filteredDocuments = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return sortedDocuments;
    return sortedDocuments.filter((d) => {
      const name = (d.name || "").toLowerCase();
      const category = (d.category || "").toLowerCase();
      const owner = (d.owner || d.ownerName || d.ownerEmail || "").toLowerCase();
      return name.includes(q) || category.includes(q) || owner.includes(q);
    });
  }, [sortedDocuments, query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (doc) => {
    onChange(doc.id, doc);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("", null);
    setQuery("");
    if (inputRef.current) inputRef.current.focus();
  };

  const isDark = theme === "dark";

  return (
    <div
      ref={containerRef}
      className="doc-search-select-container"
      style={{
        position: "relative",
        width: "100%",
        ...style,
      }}
    >
      {/* Hidden input for HTML form requirement validation if applicable */}
      <input
        type="text"
        value={value || ""}
        onChange={() => {}}
        required={required}
        tabIndex={-1}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          height: 0,
          width: 0,
        }}
      />

      <div
        className="doc-search-select-input-box"
        onClick={() => {
          setIsOpen(true);
          if (inputRef.current) inputRef.current.focus();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 12px",
          borderRadius: "9px",
          border: isOpen
            ? "1.5px solid var(--primary, #0284c7)"
            : isDark
            ? "1px solid #334155"
            : "1px solid #cbd5e1",
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          color: isDark ? "#f8fafc" : "#0f172a",
          cursor: "text",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: isOpen ? "0 0 0 3px rgba(2, 132, 199, 0.15)" : "none",
        }}
      >
        <Search size={16} style={{ color: "var(--muted, #94a3b8)", flexShrink: 0 }} />

        {/* If selected and not searching, show selected pill or allow typing to filter */}
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : selectedDoc ? selectedDoc.name : ""}
          placeholder={selectedDoc ? selectedDoc.name : placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: isDark ? "#f8fafc" : "#0f172a",
            fontSize: "0.88rem",
            fontWeight: selectedDoc && !isOpen ? 600 : 400,
          }}
        />

        {selectedDoc && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear selected document"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted, #94a3b8)",
              cursor: "pointer",
              padding: "2px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={15} />
          </button>
        )}

        <ChevronDown
          size={16}
          style={{
            color: "var(--muted, #94a3b8)",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </div>

      {isOpen && (
        <div
          className="doc-search-select-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            left: 0,
            right: 0,
            maxHeight: "280px",
            overflowY: "auto",
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
            borderRadius: "10px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
            zIndex: 1000,
            padding: "6px",
          }}
        >
          <div
            style={{
              padding: "6px 10px 8px",
              fontSize: "0.74rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--muted, #94a3b8)",
              borderBottom: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Recently Added First ({filteredDocuments.length})</span>
            <span>Type to filter</span>
          </div>

          {filteredDocuments.length === 0 ? (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                color: "var(--muted, #94a3b8)",
                fontSize: "0.85rem",
              }}
            >
              No matching documents found.
            </div>
          ) : (
            filteredDocuments.map((doc, idx) => {
              const isSelected = String(doc.id) === String(value);
              const formattedDate = doc.updated || (doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : "Recently added");

              return (
                <div
                  key={doc.id || idx}
                  onClick={() => handleSelect(doc)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? isDark
                        ? "#1e293b"
                        : "#e0f2fe"
                      : "transparent",
                    transition: "background-color 0.15s",
                    marginBottom: "3px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = isDark ? "#1e293b" : "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        backgroundColor: isDark ? "#334155" : "#f1f5f9",
                        color: "var(--primary, #0284c7)",
                        marginTop: "2px",
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={16} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            color: isDark ? "#f8fafc" : "#0f172a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "280px",
                          }}
                        >
                          {doc.name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: isDark ? "#1e3a5f" : "#e0f2fe",
                            color: isDark ? "#38bdf8" : "#0369a1",
                            fontWeight: 600,
                          }}
                        >
                          {doc.category || "General"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginTop: "3px",
                          fontSize: "0.76rem",
                          color: "var(--muted, #94a3b8)",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                          <Clock size={11} /> {formattedDate}
                        </span>
                        <span>·</span>
                        <span>{doc.size || doc.fileSize || "1.0 MB"}</span>
                        <span>·</span>
                        <span>by {doc.owner || doc.ownerName || "Owner"}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{ color: "var(--primary, #0284c7)", marginLeft: "8px", flexShrink: 0 }}>
                      <Check size={18} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
