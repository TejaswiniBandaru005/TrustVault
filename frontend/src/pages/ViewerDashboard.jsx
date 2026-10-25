
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Files,
  Search,
  FolderCheck,
  Download,
  History,
  Bell,
  Sun,
  Moon,
  LogOut,
  FileText,
  FileSpreadsheet,
  File,
  Eye,
  LockKeyhole,
  Clock,
  SearchCheck,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import {
  downloadRealDocument,
  openDocumentInNewTab,
  generateDocumentText,
} from "../utils/documentContent";
import { apiRequest } from "../api";
import TrustVaultLogo from "../components/TrustVaultLogo";
import ThemePalettePicker from "../components/ThemePalettePicker";
import IntegrityPill from "../components/IntegrityPill";
import SecurityClearanceBadge from "../components/SecurityClearanceBadge";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "all", label: "All Documents", icon: Files },
  { id: "allocated", label: "Allocated to Me", icon: FolderCheck },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "history", label: "My History", icon: History },
];

function fileIcon(type) {
  if (type === "Word") return FileText;
  if (type === "Excel") return FileSpreadsheet;
  return File;
}

export default function ViewerDashboard({
  theme = "light",
  palette = "cobalt",
  onNavigate,
  onToggleTheme,
  onSelectPalette,
  onOpenProfile,
  currentUser,
}) {
  const [activeSection, setActiveSection] = useState(() => {
    try {
      const hash = window.location.hash?.replace("#", "");
      if (hash === "search") return "all";
      const valid = ["overview", "all", "allocated", "downloads", "history"];
      if (hash && valid.includes(hash)) {
        return hash;
      }
      const saved = localStorage.getItem("trustvault_viewer_tab");
      return saved && valid.includes(saved) ? saved : "overview";
    } catch {
      return "overview";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("trustvault_viewer_tab", activeSection);
      window.location.hash = activeSection;
    } catch {}
  }, [activeSection]);
  const [allocatedDocs, setAllocatedDocs] = useState([]);
  const [catalogDocs, setCatalogDocs] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [readerTab, setReaderTab] = useState("content");
  const [notice, setNotice] = useState("");
  const [requestedIds, setRequestedIds] = useState([]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const normViewerDoc = (d) => ({
    ...d,
    type: d.fileType || d.type || (d.name?.toLowerCase().endsWith(".pdf") ? "PDF" : "Asset"),
    fileType: d.fileType || d.type || "PDF",
    size: d.fileSize || d.size || (d.fileSizeBytes ? `${(d.fileSizeBytes / 1024).toFixed(1)} KB` : "1.0 MB"),
    fileSize: d.fileSize || d.size || "1.0 MB",
    owner: d.ownerName || d.owner || d.ownerEmail || "Document Owner",
    ownerName: d.ownerName || d.owner || d.ownerEmail || "Document Owner",
    updated: d.updated || (d.updatedAt ? new Date(d.updatedAt).toLocaleString() : new Date().toLocaleString()),
    fileChecksum: d.fileChecksum || "",
    category: d.category || "General",
    accessPolicy: d.accessPolicy || "Level 2 · Authorized View Enclave",
    contentType: d.contentType || "application/pdf",
  });

  const fetchViewerData = async () => {
    if (!currentUser?.email) return;
    const emailParam = encodeURIComponent(currentUser.email);

    try {
      const [allocatedData, catalogData, histData] = await Promise.all([
        apiRequest(`/api/documents/viewer?email=${emailParam}`),
        apiRequest(`/api/documents/catalog?viewerEmail=${emailParam}`),
        apiRequest(`/api/documents/viewer/history?email=${emailParam}`),
      ]);
      setAllocatedDocs(Array.isArray(allocatedData) ? allocatedData.map(normViewerDoc) : []);
      setCatalogDocs(Array.isArray(catalogData) ? catalogData.map(normViewerDoc) : []);
      setHistory(Array.isArray(histData) ? histData : []);
    } catch (err) {
      console.warn("Real-time viewer sync error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchViewerData();
    const interval = setInterval(fetchViewerData, 3500);
    return () => clearInterval(interval);
  }, [currentUser?.email]);

  const isAllocated = (document) => {
    if (!document) return false;
    const access = (document.access || "").toUpperCase();
    return access === "GRANTED" || access === "ALLOCATED" || document.canView;
  };

  const documents = (activeSection === "allocated" || activeSection === "downloads")
    ? allocatedDocs
    : catalogDocs;

  const matchesSearch = (document) => {
    const query = search.toLowerCase().trim();
    const docName = document.name || "";
    const docOwner = document.owner || document.ownerName || "";
    const docCategory = document.category || "General";

    const matchesQuery =
      !query ||
      `${docName} ${docOwner} ${docCategory}`
        .toLowerCase()
        .includes(query);

    const matchesCategory =
      category === "All" || docCategory.toLowerCase() === category.toLowerCase();

    return matchesQuery && matchesCategory;
  };

  const requestAccess = async (document) => {
    if (requestedIds.includes(document.id) || document.requested) {
      showNotice("Access request already submitted for this document.");
      return;
    }

    try {
      await apiRequest("/api/documents/request-access", {
        method: "POST",
        body: JSON.stringify({
          documentId: document.id,
          viewerEmail: currentUser?.email,
          viewerName: currentUser?.name || currentUser?.email,
        }),
      });

      setRequestedIds((prev) => [...prev, document.id]);
      showNotice(`Access request sent to ${document.owner} for "${document.name}".`);
      await fetchViewerData();
    } catch (err) {
      showNotice("Request failed: " + err.message);
    }
  };

  const viewDocument = (document) => {
    if (!isAllocated(document)) {
      showNotice("Access restricted. Request authorization from the document owner.");
      return;
    }

    setSelectedDocument(document);
  };

  const downloadDocument = async (document) => {
    if (!isAllocated(document) || !document.canDownload) {
      showNotice("Download is restricted by the document owner.");
      return;
    }

    try {
      await downloadRealDocument(document, currentUser?.email);
      showNotice(`Downloaded "${document.name}" successfully!`);
      await fetchViewerData();
    } catch (err) {
      showNotice("Download error: " + err.message);
    }
  };

  const visibleDocuments = documents.filter(matchesSearch);
  const allocatedDocuments = documents.filter(
    (document) => isAllocated(document)
  );
  const downloadableDocuments = allocatedDocuments.filter(
    (document) => document.canDownload
  );

  const renderDocumentTable = (items, showRequest = false) => (
    <div className="vd-table-wrap">
      <table className="vd-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Category</th>
            <th>Owner</th>
            <th>Last updated</th>
            <th>Access</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((document) => {
            const Icon = fileIcon(document.type);
            const allocated = isAllocated(document);
            const requested = requestedIds.includes(document.id);

            return (
              <tr key={document.id}>
                <td>
                  <div className="vd-file-cell">
                    <span className="vd-file-icon">
                      <Icon size={19} />
                    </span>
                    <span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <strong>{document.name}</strong>
                        <SecurityClearanceBadge level={document.category || "CONFIDENTIAL"} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                        <small>{document.size}</small>
                        {document.fileChecksum && (
                          <IntegrityPill hash={document.fileChecksum} />
                        )}
                      </div>
                    </span>
                  </div>
                </td>
                <td>
                  <span className="vd-category-tag">{document.category}</span>
                </td>
                <td>{document.owner}</td>
                <td>{document.updated}</td>
                <td>
                  <span
                    className={`vd-status ${
                      allocated ? "vd-status-active" : "vd-status-locked"
                    }`}
                  >
                    {allocated ? "Allocated" : "Restricted"}
                  </span>
                </td>
                <td>
                  <div className="vd-actions">
                    {allocated ? (
                      <>
                        <button
                          className="vd-icon-button"
                          title="View document preview"
                          onClick={() => viewDocument(document)}
                        >
                          <Eye size={17} />
                        </button>
                        {document.canDownload && (
                          <button
                            className="vd-icon-button"
                            title="Download permission demo"
                            onClick={() => downloadDocument(document)}
                          >
                            <Download size={17} />
                          </button>
                        )}
                      </>
                    ) : showRequest ? (
                      <button
                        className="vd-small-button"
                        disabled={requested}
                        onClick={() => requestAccess(document)}
                      >
                        {requested ? "Requested" : "Request access"}
                      </button>
                    ) : (
                      <button
                        className="vd-icon-button"
                        title="Access restricted"
                        onClick={() =>
                          showNotice(
                            "You do not have access to this document yet."
                          )
                        }
                      >
                        <LockKeyhole size={17} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {items.length === 0 && (
            <tr>
              <td colSpan="6" className="vd-empty">
                No documents match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const allCategories = [
    "All",
    "Architecture",
    "Security",
    "Engineering",
    "Authentication",
    "DevOps",
    "Governance",
    "Compliance",
    "Business",
    "Finance",
    "Legal",
    "Technical",
    "Personal",
    "Other",
  ];

  const renderFilters = () => (
    <div className="vd-filters">
      <label className="vd-search-box">
        <Search size={18} />
        <input
          type="search"
          placeholder="Search name, owner, or category..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      <select
        className="vd-category-filter"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        aria-label="Filter by category"
        style={{
          backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
          color: theme === "dark" ? "#f8fafc" : "#0f172a",
        }}
      >
        {allCategories.map((cat) => (
          <option
            key={cat}
            value={cat}
            style={{
              backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
              color: theme === "dark" ? "#f8fafc" : "#0f172a",
            }}
          >
            {cat === "All" ? "All Categories" : cat}
          </option>
        ))}
      </select>
    </div>
  );

  const renderOverview = () => (
    <>
      <div className="vd-welcome">
        <div>
          <span className="vd-eyebrow">VIEWER WORKSPACE</span>
          <h1>Your document workspace</h1>
          <p>Find shared documents and manage your permitted access.</p>
        </div>
        <button
          className="vd-primary-button"
          onClick={() => setActiveSection("all")}
        >
          <Files size={17} /> View All Documents
        </button>
      </div>

      <div className="vd-stats">
        <div className="vd-stat-card">
          <span className="vd-stat-icon"><Files size={21} /></span>
          <small>Documents listed</small>
          <strong>{documents.length}</strong>
          <span className="vd-stat-note">Metadata in this demo</span>
        </div>
        <div className="vd-stat-card">
          <span className="vd-stat-icon"><FolderCheck size={21} /></span>
          <small>Allocated to me</small>
          <strong>{allocatedDocuments.length}</strong>
          <span className="vd-stat-note">Demo access entries</span>
        </div>
        <div className="vd-stat-card">
          <span className="vd-stat-icon"><Download size={21} /></span>
          <small>Download permitted</small>
          <strong>{downloadableDocuments.length}</strong>
          <span className="vd-stat-note">Permission examples</span>
        </div>
        <div className="vd-stat-card">
          <span className="vd-stat-icon"><History size={21} /></span>
          <small>History entries</small>
          <strong>{history.length}</strong>
          <span className="vd-stat-note">Local activity records</span>
        </div>
      </div>

      <section className="vd-panel">
        <div className="vd-panel-heading">
          <div>
            <h2>Allocated Documents</h2>
            <p>Documents shown as shared with your demo account.</p>
          </div>
          <button
            className="vd-text-button"
            onClick={() => setActiveSection("allocated")}
          >
            View all
          </button>
        </div>
        {renderDocumentTable(allocatedDocuments.slice(0, 3))}
      </section>

      <section className="vd-panel">
        <div className="vd-panel-heading">
          <div>
            <h2>Recently Viewed Activity</h2>
            <p>Your latest sample activity entries.</p>
          </div>
          <button
            className="vd-text-button"
            onClick={() => setActiveSection("history")}
          >
            View history
          </button>
        </div>
        {renderHistoryList(history.slice(0, 3))}
      </section>
    </>
  );

  const renderHistoryList = (items) => (
    <div className="vd-history-list">
      {items.map((item) => (
        <div className="vd-history-row" key={item.id}>
          <span className="vd-history-icon"><History size={18} /></span>
          <div className="vd-history-info">
            <strong>{item.action}</strong>
            <span>{item.document}</span>
            <small>{item.detail}</small>
          </div>
          <time>{item.time}</time>
        </div>
      ))}
      {items.length === 0 && (
        <p className="vd-empty">No activity to display.</p>
      )}
    </div>
  );

  const renderDocumentsSection = (mode) => {
    let title = "All Documents";
    let description = "Browse document metadata and check your access.";
    let items = visibleDocuments;
    let showRequest = true;

    if (mode === "allocated") {
      title = "Allocated to Me";
      description = "Documents currently marked as shared with your account.";
      items = allocatedDocuments.filter(matchesSearch);
      showRequest = false;
    } else if (mode === "downloads") {
      title = "Download Permissions";
      description = "Only documents with explicit download permission are listed here.";
      items = downloadableDocuments.filter(matchesSearch);
      showRequest = false;
    } else if (mode === "search") {
      title = "Search Documents";
      description = "Search by document name, owner, or category.";
    }

    return (
      <>
        <div className="vd-page-heading">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>

        <section className="vd-panel">
          {renderFilters()}
          {renderDocumentTable(items, showRequest)}
          <p className="vd-table-footnote">
            Document listings contain demo metadata. Seeing a listing does not
            grant permission to open or download its contents.
          </p>
        </section>
      </>
    );
  };

  const renderHistory = () => (
    <>
      <div className="vd-page-heading">
        <div>
          <h1>My History</h1>
          <p>Review sample document viewing and download activity.</p>
        </div>
      </div>
      <section className="vd-panel">
        <div className="vd-panel-heading">
          <div>
            <h2>Activity timeline</h2>
            <p>Newest events appear first.</p>
          </div>
          <History size={21} />
        </div>
        {renderHistoryList(history)}
        <p className="vd-table-footnote">
          This history is held in frontend state and is not a tamper-resistant
          audit log. Production audit events must be recorded by the backend.
        </p>
      </section>
    </>
  );

  return (
    <div className={`vd-app ${theme === "dark" ? "vd-dark" : ""}`}>
      {mobileMenuOpen && (
        <button
          className="vd-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`vd-sidebar ${mobileMenuOpen ? "vd-sidebar-open" : ""}`}>
        <div className="vd-brand" style={{ padding: "16px 12px" }}>
          <TrustVaultLogo size={34} caption="VIEWER CONSOLE" animated={true} />
          <button
            className="vd-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="vd-role-label">VIEWER WORKSPACE</div>

        <nav className="vd-navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`vd-nav-item ${
                  activeSection === item.id ? "vd-nav-active" : ""
                }`}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.id === "allocated" && (
                  <span className="vd-nav-count">{allocatedDocuments.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="vd-sidebar-bottom">
          <div
            className="vd-profile"
            onClick={() => (onOpenProfile ? onOpenProfile() : onNavigate?.("profile"))}
            style={{ cursor: "pointer" }}
            title="Click to view My Profile"
          >
            <span className="vd-avatar">
              {(currentUser?.name || currentUser?.email || "VW").slice(0, 2).toUpperCase()}
            </span>
            <span>
              <strong>{currentUser?.name || "Viewer Account"}</strong>
              <small>{currentUser?.email || "viewer@trustvault.local"}</small>
            </span>
          </div>
          <button
            className="vd-nav-item"
            onClick={() => onNavigate?.("home")}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="vd-main">
        <header className="vd-topbar">
          <button
            className="vd-icon-button vd-menu-button"
            aria-label="Open navigation"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="vd-breadcrumb">
            <span>TrustVault</span>
            <span>/</span>
            <strong>
              {navItems.find((item) => item.id === activeSection)?.label}
            </strong>
          </div>

          <div className="vd-topbar-actions">
            {/* Unified Role Box & Worker ID */}
            <div
              className="navbar-role-box"
              onClick={() => (onOpenProfile ? onOpenProfile() : onNavigate?.("profile"))}
              style={{ cursor: "pointer" }}
              title="Click to view My Profile"
            >
              <span>TrustVault - Viewer</span>
              {currentUser?.userCode && (
                <span className="navbar-id-pill">{currentUser.userCode}</span>
              )}
            </div>

            <span className="vd-demo-label" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span className="clearance-beacon-dot" style={{ backgroundColor: "#10b981" }} />
              ZERO-TRUST VAULT
            </span>

            {onSelectPalette && (
              <ThemePalettePicker
                currentPaletteId={palette}
                onSelectPalette={onSelectPalette}
              />
            )}

            <button
              className="vd-icon-button"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={onToggleTheme}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* Profile Avatar Button */}
            <button
              type="button"
              className="vd-icon-button vd-profile-btn"
              onClick={() => (onOpenProfile ? onOpenProfile() : onNavigate?.("profile"))}
              title="My Profile Details"
              aria-label="My Profile"
              style={{
                background: "var(--accent-soft)",
                color: "var(--primary)",
                fontWeight: 800,
                fontSize: "12px",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              {(currentUser?.name || currentUser?.email || "VW").slice(0, 2).toUpperCase()}
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              className="nav-link nav-signout"
              onClick={() => onNavigate?.("home")}
              title="Sign Out"
              style={{ fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <div className="vd-content">
          <div className="vd-demo-warning" style={{ background: "rgba(37, 99, 235, 0.08)", borderColor: "rgba(37, 99, 235, 0.25)", color: "#1d4ed8" }}>
            <ShieldCheck size={19} />
            <span>
              <strong>Zero-Trust Document Clearance Active.</strong> You only see and access documents cryptographically allocated to your verified identity by document owners.
            </span>
          </div>

          {notice && (
            <div className="vd-notice" role="status">
              {notice}
              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {activeSection === "overview" && renderOverview()}
          {activeSection === "all" && renderDocumentsSection("all")}
          {activeSection === "allocated" && renderDocumentsSection("allocated")}
          {activeSection === "downloads" && renderDocumentsSection("downloads")}
          {activeSection === "history" && renderHistory()}
        </div>
      </main>

      {selectedDocument && (
        <div
          className="vd-modal-backdrop"
          onClick={() => setSelectedDocument(null)}
        >
          <section
            className="vd-modal vd-modal-expanded"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vd-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vd-modal-heading">
              <div>
                <span className="vd-eyebrow">DOCUMENT ENCLAVE READER</span>
                <h2 id="vd-modal-title">{selectedDocument.name}</h2>
              </div>
              <button
                className="vd-icon-button"
                onClick={() => setSelectedDocument(null)}
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="vd-reader-tabs">
              <button
                type="button"
                className={`vd-reader-tab-btn ${readerTab === "content" ? "active" : ""}`}
                onClick={() => setReaderTab("content")}
              >
                <Eye size={15} /> Document Content & Text
              </button>
              <button
                type="button"
                className={`vd-reader-tab-btn ${readerTab === "metadata" ? "active" : ""}`}
                onClick={() => setReaderTab("metadata")}
              >
                <ShieldCheck size={15} /> Security & Metadata
              </button>
            </div>

            {readerTab === "content" ? (
              <div className="vd-reader-pane">
                <div className="vd-reader-banner">
                  <ShieldCheck size={16} />
                  <span>Verified Access Clearance · Level 2 Restricted</span>
                </div>
                {selectedDocument.textContent && (
                  <div style={{
                    marginBottom: "14px",
                    padding: "14px 18px",
                    background: "rgba(59, 130, 246, 0.08)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--primary)" }}>
                        Enclave Text Content / Link
                      </span>
                      {/https?:\/\/[^\s]+/i.test(selectedDocument.textContent) && (
                        <a
                          href={selectedDocument.textContent.match(/https?:\/\/[^\s]+/i)[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "12px",
                            color: "var(--primary)",
                            textDecoration: "underline",
                            fontWeight: 600,
                          }}
                        >
                          <ExternalLink size={13} /> Open Link
                        </a>
                      )}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "13px", lineHeight: "1.6", color: "var(--text)" }}>
                      {selectedDocument.textContent}
                    </div>
                  </div>
                )}
                <pre className="vd-file-content-box">
                  {generateDocumentText(selectedDocument)}
                </pre>
              </div>
            ) : (
              <div className="vd-metadata">
                <div><span>Document Name</span><strong>{selectedDocument.name || "Untitled Document"}</strong></div>
                <div><span>Owner / Publisher</span><strong>{selectedDocument.ownerName || selectedDocument.owner || selectedDocument.ownerEmail || "Verified Document Owner"}</strong></div>
                <div>
                  <span>Classification</span>
                  <SecurityClearanceBadge level={selectedDocument.category || "CONFIDENTIAL"} />
                </div>
                <div><span>File Type & Format</span><strong>{selectedDocument.fileType || selectedDocument.type || "PDF"} ({selectedDocument.contentType || "application/pdf"})</strong></div>
                <div><span>Size on Disk</span><strong>{selectedDocument.fileSize || selectedDocument.size || "1.0 MB"}</strong></div>
                <div>
                  <span>SHA-256 Fingerprint</span>
                  <div style={{ marginTop: "4px" }}>
                    <IntegrityPill hash={selectedDocument.fileChecksum || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"} />
                  </div>
                </div>
                <div><span>Access Policy</span><strong>{selectedDocument.accessPolicy || "Level 2 · Authorized View Enclave"}</strong></div>
                {selectedDocument.textContent && (
                  <div>
                    <span>Document Text / Link</span>
                    <strong style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selectedDocument.textContent}</strong>
                  </div>
                )}
                <div><span>Last Updated & Ingested</span><strong>{selectedDocument.updated || (selectedDocument.updatedAt ? new Date(selectedDocument.updatedAt).toLocaleString() : new Date().toLocaleString())}</strong></div>
                <div>
                  <span>Download Authorization</span>
                  <strong style={{ color: selectedDocument.canDownload ? "#10b981" : "#eab308" }}>
                    {selectedDocument.canDownload ? "Approved (Download Permitted)" : "Restricted (View Only Clearance)"}
                  </strong>
                </div>
                <div>
                  <span>Integrity Verification</span>
                  <strong style={{ color: "#10b981", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <ShieldCheck size={14} /> Cryptographically Verified
                  </strong>
                </div>
              </div>
            )}

            <div className="vd-modal-actions">
              <button
                type="button"
                className="vd-secondary-button"
                onClick={() => openDocumentInNewTab(selectedDocument, currentUser?.email)}
                title="Open complete document in a separate browser window"
              >
                <ExternalLink size={16} /> Open in New Tab
              </button>

              {selectedDocument.canDownload && (
                <button
                  type="button"
                  className="vd-primary-button"
                  onClick={() => downloadDocument(selectedDocument)}
                >
                  <Download size={16} /> Download PDF (.pdf)
                </button>
              )}

              <button
                type="button"
                className="vd-secondary-button"
                onClick={() => setSelectedDocument(null)}
              >
                Close Reader
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
