
import { useState } from "react";
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
} from "lucide-react";

const demoDocuments = [
  {
    id: 1,
    name: "Business Proposal.pdf",
    category: "Business",
    owner: "owner@example.com",
    updated: "Oct 20, 2026",
    type: "PDF",
    size: "2.4 MB",
    access: "Allocated",
    canDownload: false,
  },
  {
    id: 2,
    name: "Financial Report.docx",
    category: "Finance",
    owner: "finance@example.com",
    updated: "Oct 18, 2026",
    type: "Word",
    size: "1.8 MB",
    access: "Allocated",
    canDownload: true,
  },
  {
    id: 3,
    name: "Project Requirements.pdf",
    category: "Technical",
    owner: "owner@example.com",
    updated: "Oct 15, 2026",
    type: "PDF",
    size: "950 KB",
    access: "Not allocated",
    canDownload: false,
  },
  {
    id: 4,
    name: "Marketing Plan.xlsx",
    category: "Business",
    owner: "marketing@example.com",
    updated: "Oct 12, 2026",
    type: "Excel",
    size: "780 KB",
    access: "Not allocated",
    canDownload: false,
  },
];

const demoHistory = [
  {
    id: 1,
    action: "Document viewed",
    document: "Business Proposal.pdf",
    time: "Today, 10:30 AM",
    detail: "View-only access",
  },
  {
    id: 2,
    action: "Document downloaded",
    document: "Financial Report.docx",
    time: "Yesterday, 4:15 PM",
    detail: "Download permission available",
  },
  {
    id: 3,
    action: "Access granted",
    document: "Business Proposal.pdf",
    time: "Oct 19, 2026",
    detail: "Granted by document owner",
  },
];

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "all", label: "All Documents", icon: Files },
  { id: "search", label: "Search Documents", icon: Search },
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
  onNavigate,
  onToggleTheme,
}) {
  const [activeSection, setActiveSection] = useState("overview");
  const [documents, setDocuments] = useState(demoDocuments);
  const [history, setHistory] = useState(demoHistory);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [notice, setNotice] = useState("");
  const [requestedIds, setRequestedIds] = useState([]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const addHistory = (action, documentName, detail) => {
    setHistory((previous) => [
      {
        id: Date.now(),
        action,
        document: documentName,
        time: new Date().toLocaleString(),
        detail,
      },
      ...previous,
    ]);
  };

  const isAllocated = (document) => document.access === "Allocated";

  const matchesSearch = (document) => {
    const query = search.toLowerCase().trim();
    const matchesQuery =
      !query ||
      `${document.name} ${document.owner} ${document.category}`
        .toLowerCase()
        .includes(query);
    const matchesCategory =
      category === "All" || document.category === category;

    return matchesQuery && matchesCategory;
  };

  const requestAccess = (document) => {
    if (requestedIds.includes(document.id)) {
      showNotice("You have already requested access in this demo.");
      return;
    }

    setRequestedIds((previous) => [...previous, document.id]);
    showNotice(
      "Demo request recorded locally. The document owner has not been notified."
    );
  };

  const viewDocument = (document) => {
    if (!isAllocated(document)) {
      showNotice("Access required. Request permission from the document owner.");
      return;
    }

    setSelectedDocument(document);
    addHistory("Document viewed", document.name, "Demo view-only preview");
  };

  const downloadDocument = (document) => {
    if (!isAllocated(document) || !document.canDownload) {
      showNotice("Download is not permitted for this document.");
      return;
    }

    addHistory(
      "Download attempted",
      document.name,
      "Demo only — no file was downloaded"
    );
    showNotice(
      "Download permission is enabled in the demo, but no real file is stored."
    );
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
                      <strong>{document.name}</strong>
                      <small>{document.size}</small>
                    </span>
                  </div>
                </td>
                <td>{document.category}</td>
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
      >
        <option>All</option>
        <option>Business</option>
        <option>Finance</option>
        <option>Technical</option>
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
          onClick={() => setActiveSection("search")}
        >
          <Search size={17} /> Find a document
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
        <div className="vd-brand">
          <span className="vd-brand-mark"><LockKeyhole size={23} /></span>
          <span className="vd-brand-text">
            <strong>TrustVault</strong>
            <small>Secure document space</small>
          </span>
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
          <div className="vd-profile">
            <span className="vd-avatar">VW</span>
            <span>
              <strong>Viewer Account</strong>
              <small>viewer@example.com</small>
            </span>
          </div>
          <button
            className="vd-nav-item"
            onClick={() => onNavigate?.("home")}
          >
            <LogOut size={18} />
            <span>Back to Home</span>
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
            <span className="vd-demo-label">DEMO MODE</span>
            <button
              className="vd-icon-button"
              title="Notifications"
              onClick={() =>
                showNotice("Notifications are not connected in this demo.")
              }
            >
              <Bell size={19} />
            </button>
            <button
              className="vd-icon-button"
              title="Toggle theme"
              onClick={onToggleTheme}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>

        <div className="vd-content">
          <div className="vd-demo-warning">
            <ShieldCheck size={19} />
            <span>
              <strong>Frontend prototype only.</strong> All sample document
              data and permission checks run in the browser. Real access must
              be enforced by the backend before deployment.
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
          {activeSection === "search" && renderDocumentsSection("search")}
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
            className="vd-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vd-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vd-modal-heading">
              <div>
                <span className="vd-eyebrow">DOCUMENT PREVIEW</span>
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

            <div className="vd-preview-notice">
              <Eye size={24} />
              <strong>Preview placeholder</strong>
              <p>
                This demo does not contain the actual document file. When the
                backend is connected, this area will display the document only
                after server-side authorization succeeds.
              </p>
            </div>

            <div className="vd-metadata">
              <div><span>Owner</span><strong>{selectedDocument.owner}</strong></div>
              <div><span>Category</span><strong>{selectedDocument.category}</strong></div>
              <div><span>File type</span><strong>{selectedDocument.type}</strong></div>
              <div><span>Updated</span><strong>{selectedDocument.updated}</strong></div>
              <div>
                <span>Download permission</span>
                <strong>{selectedDocument.canDownload ? "Enabled in demo" : "Not permitted"}</strong>
              </div>
            </div>

            <div className="vd-modal-actions">
              {selectedDocument.canDownload && (
                <button
                  className="vd-primary-button"
                  onClick={() => downloadDocument(selectedDocument)}
                >
                  <Download size={17} /> Download demo
                </button>
              )}
              <button
                className="vd-secondary-button"
                onClick={() => setSelectedDocument(null)}
              >
                Close preview
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
